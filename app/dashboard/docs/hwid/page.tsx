/**
 * HWID Generation Guide - Redesigned
 * Clean, minimal, and user-friendly with dark mode
 */

'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ScrollAnimateWrapper from '@/components/ScrollAnimateWrapper';
import toast from 'react-hot-toast';

type Platform = 'nodejs' | 'browser' | 'python' | 'csharp' | 'java';

export default function HWIDGenerationPage() {
  const [activePlatform, setActivePlatform] = useState<Platform>('nodejs');

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  const platforms = [
    { id: 'nodejs', name: 'Node.js', icon: '🟢' },
    { id: 'browser', name: 'Browser', icon: '🌐' },
    { id: 'python', name: 'Python', icon: '🐍' },
    { id: 'csharp', name: 'C#', icon: '🔷' },
    { id: 'java', name: 'Java', icon: '☕' },
  ];

  const examples = {
    nodejs: `const crypto = require('crypto');
const os = require('os');

function generateHWID() {
  try {
    // Combine multiple hardware identifiers
    const cpus = os.cpus().map(cpu => cpu.model).join('');
    const platform = os.platform() + os.arch();
    const hostname = os.hostname();
    
    // Create a unique identifier
    const combined = cpus + platform + hostname;
    
    // Hash for privacy and consistency
    const hwid = crypto.createHash('sha256')
      .update(combined)
      .digest('hex');
    
    return hwid;
  } catch (error) {
    console.error('Failed to generate HWID:', error);
    return null;
  }
}

// Usage
const hwid = generateHWID();
console.log('✅ HWID Generated:', hwid);`,
    browser: `class BrowserHWID {
  static async generate() {
    // Browser fingerprinting components
    const components = [
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      navigator.language,
      navigator.platform,
      navigator.hardwareConcurrency,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      navigator.userAgent
    ];
    
    // Create canvas fingerprint
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('HWID', 2, 2);
    const canvasData = canvas.toDataURL();
    
    const combined = components.join('|') + canvasData;
    return await this.sha256(combined);
  }
  
  static async sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

// Usage
const hwid = await BrowserHWID.generate();
console.log('✅ Browser HWID:', hwid);`,
    python: `import hashlib
import uuid
import platform

def generate_hwid():
    """Generate a unique hardware ID for the current machine"""
    try:
        # Combine multiple hardware identifiers
        components = [
            str(uuid.getnode()),  # MAC address
            platform.machine(),
            platform.processor(),
            platform.system()
        ]
        
        # Join and hash
        combined = '|'.join(components)
        hwid = hashlib.sha256(combined.encode()).hexdigest()
        
        return hwid
    except Exception as e:
        print(f"Error generating HWID: {e}")
        return None

# Usage
hwid = generate_hwid()
if hwid:
    print(f"✅ HWID Generated: {hwid}")
else:
    print("❌ Failed to generate HWID")`,
    csharp: `using System;
using System.Security.Cryptography;
using System.Text;
using System.Management;

public class HWIDGenerator
{
    public static string GenerateHWID()
    {
        try
        {
            var components = new StringBuilder();
            
            // Machine name
            components.Append(Environment.MachineName);
            components.Append("|");
            
            // OS Version
            components.Append(Environment.OSVersion);
            components.Append("|");
            
            // Processor ID (if available)
            components.Append(GetProcessorId());
            
            return HashString(components.ToString());
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error generating HWID: {ex.Message}");
            return null;
        }
    }
    
    private static string GetProcessorId()
    {
        try
        {
            using (var searcher = new ManagementObjectSearcher("SELECT ProcessorId FROM Win32_Processor"))
            {
                foreach (var obj in searcher.Get())
                {
                    return obj["ProcessorId"]?.ToString() ?? "";
                }
            }
        }
        catch
        {
            return Environment.ProcessorCount.ToString();
        }
        return "";
    }
    
    private static string HashString(string input)
    {
        using (var sha256 = SHA256.Create())
        {
            byte[] bytes = Encoding.UTF8.GetBytes(input);
            byte[] hash = sha256.ComputeHash(bytes);
            return BitConverter.ToString(hash).Replace("-", "").ToLower();
        }
    }
}

// Usage
string hwid = HWIDGenerator.GenerateHWID();
if (hwid != null)
{
    Console.WriteLine($"✅ HWID Generated: {hwid}");
}`,
    java: `import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;
import java.net.NetworkInterface;
import java.util.Enumeration;

public class HWIDGenerator {
    
    public static String generateHWID() {
        try {
            StringBuilder components = new StringBuilder();
            
            // System properties
            components.append(System.getProperty("os.name"));
            components.append("|");
            components.append(System.getProperty("os.arch"));
            components.append("|");
            components.append(System.getProperty("user.name"));
            components.append("|");
            
            // MAC address
            components.append(getMacAddress());
            
            return hashString(components.toString());
        } catch (Exception e) {
            System.err.println("Error generating HWID: " + e.getMessage());
            return null;
        }
    }
    
    private static String getMacAddress() throws Exception {
        Enumeration<NetworkInterface> networks = 
            NetworkInterface.getNetworkInterfaces();
        
        while (networks.hasMoreElements()) {
            NetworkInterface network = networks.nextElement();
            byte[] mac = network.getHardwareAddress();
            
            if (mac != null) {
                StringBuilder sb = new StringBuilder();
                for (byte b : mac) {
                    sb.append(String.format("%02X", b));
                }
                return sb.toString();
            }
        }
        return "";
    }
    
    private static String hashString(String input) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
        
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }
    
    // Usage
    public static void main(String[] args) {
        String hwid = generateHWID();
        if (hwid != null) {
            System.out.println("✅ HWID Generated: " + hwid);
        }
    }
}`,
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <ScrollAnimateWrapper animation="fade">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              HWID Generation 🔑
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Generate unique hardware identifiers for device binding
            </p>
          </div>
        </ScrollAnimateWrapper>

        {/* Important Notes */}
        <ScrollAnimateWrapper animation="scale">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="text-2xl">⚠️</div>
              <h2 className="text-lg font-bold text-amber-900 dark:text-amber-200">Important Guidelines</h2>
            </div>
            <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-300">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                <span>Always hash HWIDs before transmission for privacy protection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                <span>Choose stable hardware components that persist across reboots</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                <span>Combine multiple identifiers for better uniqueness</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                <span>Implement fallback mechanisms for missing hardware info</span>
              </li>
            </ul>
          </div>
        </ScrollAnimateWrapper>

        {/* Platform Selector */}
        <ScrollAnimateWrapper animation="slide-left">
          <div className="flex flex-wrap gap-2">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => setActivePlatform(platform.id as Platform)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activePlatform === platform.id
                    ? 'bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 text-white shadow-lg'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <span className="text-lg">{platform.icon}</span>
                {platform.name}
              </button>
            ))}
          </div>
        </ScrollAnimateWrapper>

        {/* Code Example */}
        <ScrollAnimateWrapper animation="fade" delay={100}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 dark:bg-slate-950 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-2xl">{platforms.find(p => p.id === activePlatform)?.icon}</span>
                {platforms.find(p => p.id === activePlatform)?.name} Example
              </h3>
              <button
                onClick={() => copyCode(examples[activePlatform])}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Code
              </button>
            </div>
            <div className="p-6">
              <div className="bg-slate-950 dark:bg-black rounded-lg p-6 overflow-x-auto">
                <pre className="text-sm text-slate-100 font-mono">
                  <code>{examples[activePlatform]}</code>
                </pre>
              </div>
            </div>
          </div>
        </ScrollAnimateWrapper>

        {/* Best Practices */}
        <ScrollAnimateWrapper animation="slide-right" delay={200}>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="text-2xl">✅</div>
              <h2 className="text-lg font-bold text-green-900 dark:text-green-200">Best Practices</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: '🔒', text: 'Hash with SHA-256 or similar' },
                { icon: '💾', text: 'Store locally for consistency' },
                { icon: '🧪', text: 'Test on multiple devices' },
                { icon: '🛡️', text: 'Handle errors gracefully' },
                { icon: '📢', text: 'Inform users about binding' },
                { icon: '🔄', text: 'Provide device reset option' },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white dark:bg-green-950/20 rounded-lg">
                  <span className="text-xl">{item.icon}</span>
                  <p className="text-sm text-green-800 dark:text-green-300 font-medium">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollAnimateWrapper>

        {/* Security Note */}
        <ScrollAnimateWrapper animation="scale" delay={300}>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🔐</div>
              <div>
                <h2 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-2">Privacy & Security</h2>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                  HWID binding helps protect your application from unauthorized access. However, remember:
                </p>
                <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                    <span>Never transmit raw hardware identifiers - always hash them first</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                    <span>Provide clear privacy policies about device binding</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                    <span>Allow users to reset their HWID if they upgrade hardware</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </ScrollAnimateWrapper>
      </div>
    </DashboardLayout>
  );
}
