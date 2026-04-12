"""
Python Authentication Client with HWID-based Device Binding
Cross-platform support for Windows, Linux, and macOS
"""

import asyncio
import hashlib
import platform
import subprocess
import uuid
import aiohttp
import logging
from typing import Optional, Dict, Any
from dataclasses import dataclass
from datetime import datetime, timedelta


class AuthException(Exception):
    """Custom exception for authentication errors"""
    def __init__(self, message: str, error_code: str):
        self.message = message
        self.error_code = error_code
        super().__init__(f"[{error_code}] {message}")


@dataclass
class UserInfo:
    """User information model"""
    id: str
    username: str
    email: str
    hwid: str
    hwid_locked: bool
    ip: str
    is_first_login: bool = False
    expires_at: Optional[str] = None


@dataclass
class LoginResponse:
    """Login response model"""
    success: bool
    message: str
    token: Optional[str] = None
    user: Optional[UserInfo] = None


class HWIDGenerator:
    """Cross-platform Hardware ID generator"""
    
    @staticmethod
    def generate() -> str:
        """
        Generate unique HWID based on the current platform
        Windows: User SID → System UUID → Processor ID
        Linux: Machine ID → DMI UUID → MAC Address
        macOS: Hardware UUID → MAC Address → Serial Number
        """
        system = platform.system()
        
        try:
            if system == "Windows":
                return HWIDGenerator._generate_windows()
            elif system == "Linux":
                return HWIDGenerator._generate_linux()
            elif system == "Darwin":  # macOS
                return HWIDGenerator._generate_macos()
            else:
                return HWIDGenerator._generate_fallback()
        except Exception as e:
            logging.warning(f"HWID generation failed: {e}, using fallback")
            return HWIDGenerator._generate_fallback()
    
    @staticmethod
    def _generate_windows() -> str:
        """Generate HWID for Windows"""
        try:
            # Primary: Windows User SID
            import win32security
            token = win32security.OpenProcessToken(
                win32security.GetCurrentProcess(),
                win32security.TOKEN_QUERY
            )
            sid = win32security.GetTokenInformation(
                token, win32security.TokenUser
            )[0]
            sid_string = win32security.ConvertSidToStringSid(sid)
            return HWIDGenerator._hash_string(sid_string)
        except:
            pass
        
        try:
            # Secondary: System UUID from WMI
            import wmi
            c = wmi.WMI()
            for item in c.Win32_ComputerSystemProduct():
                if item.UUID:
                    return HWIDGenerator._hash_string(item.UUID)
        except:
            pass
        
        # Tertiary: MAC Address
        mac = HWIDGenerator._get_mac_address()
        if mac:
            return HWIDGenerator._hash_string(mac)
        
        return HWIDGenerator._generate_fallback()
    
    @staticmethod
    def _generate_linux() -> str:
        """Generate HWID for Linux"""
        try:
            # Primary: Machine ID
            with open('/etc/machine-id', 'r') as f:
                machine_id = f.read().strip()
                if machine_id:
                    return HWIDGenerator._hash_string(machine_id)
        except:
            pass
        
        try:
            # Secondary: DMI System UUID
            with open('/sys/class/dmi/id/product_uuid', 'r') as f:
                dmi_uuid = f.read().strip()
                if dmi_uuid:
                    return HWIDGenerator._hash_string(dmi_uuid)
        except:
            pass
        
        # Tertiary: MAC Address
        mac = HWIDGenerator._get_mac_address()
        if mac:
            return HWIDGenerator._hash_string(mac)
        
        return HWIDGenerator._generate_fallback()
    
    @staticmethod
    def _generate_macos() -> str:
        """Generate HWID for macOS"""
        try:
            # Primary: Hardware UUID
            result = subprocess.run(
                ['system_profiler', 'SPHardwareDataType'],
                capture_output=True,
                text=True
            )
            for line in result.stdout.split('\n'):
                if 'Hardware UUID' in line:
                    hw_uuid = line.split(':')[1].strip()
                    return HWIDGenerator._hash_string(hw_uuid)
        except:
            pass
        
        # Secondary: MAC Address
        mac = HWIDGenerator._get_mac_address()
        if mac:
            return HWIDGenerator._hash_string(mac)
        
        return HWIDGenerator._generate_fallback()
    
    @staticmethod
    def _get_mac_address() -> Optional[str]:
        """Get the MAC address of the first physical network interface"""
        try:
            mac = ':'.join(['{:02x}'.format((uuid.getnode() >> elements) & 0xff)
                          for elements in range(0, 8*6, 8)][::-1])
            return mac if mac != '00:00:00:00:00:00' else None
        except:
            return None
    
    @staticmethod
    def _generate_fallback() -> str:
        """Fallback HWID generation"""
        fallback_string = f"{platform.node()}-{platform.machine()}-{uuid.getnode()}"
        return HWIDGenerator._hash_string(fallback_string)
    
    @staticmethod
    def _hash_string(input_str: str) -> str:
        """Hash a string using SHA-256"""
        return hashlib.sha256(input_str.encode('utf-8')).hexdigest()


class AuthClient:
    """
    Main authentication client with HWID-based device binding
    """
    
    def __init__(self, api_base_url: str, api_key: str):
        """
        Initialize the authentication client
        
        Args:
            api_base_url: Base URL of the authentication API
            api_key: Your application's API key
        """
        self.api_base_url = api_base_url.rstrip('/')
        self.api_key = api_key
        self._session: Optional[aiohttp.ClientSession] = None
        self._jwt_token: Optional[str] = None
        self._heartbeat_task: Optional[asyncio.Task] = None
        self._hwid: Optional[str] = None
        
        # Configure logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger('AuthClient')
    
    @property
    def hwid(self) -> str:
        """Get the current device HWID (cached)"""
        if not self._hwid:
            self._hwid = HWIDGenerator.generate()
        return self._hwid
    
    async def __aenter__(self):
        """Async context manager entry"""
        await self._ensure_session()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        await self.close()
    
    async def _ensure_session(self):
        """Ensure aiohttp session exists"""
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession(
                headers={
                    'User-Agent': 'AuthSystem-Python-SDK/1.0',
                    'Content-Type': 'application/json'
                }
            )
    
    async def close(self):
        """Close the client and cleanup resources"""
        if self._heartbeat_task:
            self._heartbeat_task.cancel()
            try:
                await self._heartbeat_task
            except asyncio.CancelledError:
                pass
        
        if self._session and not self._session.closed:
            await self._session.close()
    
    async def register(
        self,
        username: str,
        password: str,
        email: str,
        license_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Register a new user account
        
        Args:
            username: Desired username
            password: Account password
            email: User email address
            license_key: Optional license key
            
        Returns:
            Registration response dictionary
        """
        payload = {
            'apiKey': self.api_key,
            'username': username,
            'password': password,
            'email': email,
            'hwid': self.hwid
        }
        
        if license_key:
            payload['licenseKey'] = license_key
        
        return await self._send_request('POST', '/api/user/create', payload)
    
    async def login(self, username: str, password: str) -> LoginResponse:
        """
        Login with username and password
        The server will automatically bind this device's HWID to the account
        
        Args:
            username: Account username
            password: Account password
            
        Returns:
            LoginResponse object with user info and token
        """
        payload = {
            'apiKey': self.api_key,
            'username': username,
            'password': password,
            'hwid': self.hwid
        }
        
        response = await self._send_request('POST', '/api/user/login', payload)
        
        if response.get('success'):
            self._jwt_token = response.get('token')
            self._start_heartbeat()
            
            user_data = response.get('user', {})
            user_info = UserInfo(
                id=user_data.get('id'),
                username=user_data.get('username'),
                email=user_data.get('email'),
                hwid=user_data.get('hwid'),
                hwid_locked=user_data.get('hwidLocked', False),
                ip=user_data.get('ip'),
                is_first_login=user_data.get('isFirstLogin', False),
                expires_at=user_data.get('expiresAt')
            )
            
            return LoginResponse(
                success=True,
                message=response.get('message'),
                token=self._jwt_token,
                user=user_info
            )
        else:
            return LoginResponse(
                success=False,
                message=response.get('message', 'Login failed')
            )
    
    async def validate_license(self, license_key: str) -> Dict[str, Any]:
        """
        Validate a license key
        
        Args:
            license_key: License key to validate
            
        Returns:
            Validation response dictionary
        """
        payload = {
            'apiKey': self.api_key,
            'licenseKey': license_key,
            'hwid': self.hwid
        }
        
        return await self._send_request('POST', '/api/auth/validate', payload)
    
    async def check_session(self) -> Dict[str, Any]:
        """
        Check if the current session is still valid
        
        Returns:
            Session status dictionary
        """
        return await self._send_request('GET', '/api/user/session')
    
    async def logout(self) -> Dict[str, Any]:
        """
        Logout and invalidate the current session
        
        Returns:
            Logout response dictionary
        """
        self._stop_heartbeat()
        response = await self._send_request('POST', '/api/user/logout')
        self._jwt_token = None
        return response
    
    def _start_heartbeat(self):
        """Start the session heartbeat task"""
        if self._heartbeat_task is None or self._heartbeat_task.done():
            self._heartbeat_task = asyncio.create_task(self._heartbeat_loop())
    
    def _stop_heartbeat(self):
        """Stop the session heartbeat task"""
        if self._heartbeat_task:
            self._heartbeat_task.cancel()
            self._heartbeat_task = None
    
    async def _heartbeat_loop(self):
        """Background task to keep session alive"""
        try:
            while True:
                await asyncio.sleep(300)  # 5 minutes
                try:
                    await self.check_session()
                    self.logger.debug("Heartbeat successful")
                except Exception as e:
                    self.logger.warning(f"Heartbeat failed: {e}")
        except asyncio.CancelledError:
            self.logger.debug("Heartbeat cancelled")
    
    async def _send_request(
        self,
        method: str,
        endpoint: str,
        payload: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Send HTTP request to the API
        
        Args:
            method: HTTP method (GET, POST, etc.)
            endpoint: API endpoint path
            payload: Optional request payload
            
        Returns:
            Response dictionary
        """
        await self._ensure_session()
        
        url = f"{self.api_base_url}{endpoint}"
        headers = {
            'X-HWID': self.hwid
        }
        
        if self._jwt_token:
            headers['Authorization'] = f'Bearer {self._jwt_token}'
        
        try:
            async with self._session.request(
                method,
                url,
                json=payload if payload else None,
                headers=headers
            ) as response:
                response_data = await response.json()
                
                if response.status >= 400:
                    error_code = response_data.get('errorCode', 'REQUEST_FAILED')
                    error_message = response_data.get('message', 'Request failed')
                    raise AuthException(error_message, error_code)
                
                return response_data
                
        except aiohttp.ClientError as e:
            raise AuthException(f"Network error: {str(e)}", "NETWORK_ERROR")
        except AuthException:
            raise
        except Exception as e:
            raise AuthException(f"Unexpected error: {str(e)}", "UNKNOWN_ERROR")


# Example Usage
async def example_usage():
    """
    Example demonstrating how to use the AuthClient
    """
    # Initialize the client
    async with AuthClient(
        "https://www.licensify.space",
        "your-api-key-here"
    ) as client:
        
        try:
            # Get the current device HWID
            hwid = client.hwid
            print(f"Device HWID: {hwid}")
            
            # Register a new user
            register_result = await client.register(
                username="johndoe",
                password="SecurePassword123",
                email="john@example.com",
                license_key="LICENSE-KEY-123"
            )
            print(f"Registration: {register_result}")
            
            # Login (first time - device will be locked)
            login_result = await client.login("johndoe", "SecurePassword123")
            
            if login_result.success:
                print(f"Login successful! Welcome {login_result.user.username}")
                
                if login_result.user.is_first_login:
                    print("This device has been locked to your account!")
                
                print(f"HWID Locked: {login_result.user.hwid_locked}")
                print(f"Current IP: {login_result.user.ip}")
                
                # Validate license
                validate_result = await client.validate_license("LICENSE-KEY-123")
                print(f"License validation: {validate_result}")
                
                # Session is automatically maintained with heartbeat
                await asyncio.sleep(10)
                
                # Check session
                session_status = await client.check_session()
                print(f"Session status: {session_status}")
                
                # Logout
                logout_result = await client.logout()
                print(f"Logout: {logout_result}")
            
        except AuthException as e:
            print(f"Authentication error [{e.error_code}]: {e.message}")
            
            # Handle specific errors
            if e.error_code == "HWID_LOCKED":
                print("This account is locked to a different device!")
            elif e.error_code == "INVALID_CREDENTIALS":
                print("Wrong username or password!")
            elif e.error_code == "LICENSE_EXPIRED":
                print("Your license has expired!")


if __name__ == "__main__":
    # Run the example
    asyncio.run(example_usage())

