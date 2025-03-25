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
          thoughtLogRef.current.textContent += '\n\n'; // Add two new lines after each thought
          thoughtLogRef.current.scrollTop = thoughtLogRef.current.scrollHeight
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
    thoughtLogRef.current.textContent += `\n${thought}\n\n` // Added extra new line
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

// 
const progressHackerSession = async (retryCount = 0) => {
  const MAX_ITERATIONS = 50;
  let iterationCount = 0;
  let isSystemPwned = false;

  // [1] FIRST API CALL: Simulate command output
  const executeHackerCommand = async (command: string, context: string) => {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer sk-100f6cbc87464ad490409ae9aa67bf40`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `Simulate realistic Linux command output for: ${command}. Our objective is to pivot our attack into the network and find other vulnerable servers.`
          },
          {
            role: "user",
            content: context
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });
    return (await response.json()).choices[0].message.content;
  };

  // [2] SECOND API CALL: Determine next command
  const getNextHackerCommand = async (lastOutput: string) => {
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer sk-100f6cbc87464ad490409ae9aa67bf40`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: `Provide next penetration testing command as JSON. Example:
              {"command":"nmap -sV 192.168.1.1","thought":"Scanning for open ports"}`
            },
            {
              role: "user",
              content: `Last output: ${lastOutput}\n\nSuggested next command so we can continue pivoting our attack based on the cyber kill chain penetration testing the server and network, the output must`
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
          max_tokens: 500
        })
      });
  
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
  
      const data = await response.json();
      
      // Validate response structure
      if (!data?.choices?.[0]?.message?.content) {
        throw new Error("Invalid API response structure");
      }
  
      const parsed = JSON.parse(data.choices[0].message.content);
      
      // Validate command format
      if (!parsed.command || !parsed.thought) {
        throw new Error("Missing command or thought in response");
      }
  
      return parsed;
  
    } catch (error) {
      console.error("API Error:", error);
      // Fallback commands if API fails
      const fallbacks = [
        {command: "nmap -sV -p- localhost", thought: "Performing network scan"},
        {command: "curl -I http://localhost", thought: "Checking web server"},
        {command: "sudo netstat -tulpn", thought: "Checking listening ports"}
      ];
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
  };

  try {
    while (iterationCount < MAX_ITERATIONS && !isSystemPwned) {
      // [3] MAIN EXECUTION LOOP
      const { command, thought } = await getNextHackerCommand(
        sessionHistory.slice(-1)[0]?.output || "Initial scan"
      );
      
      const output = await executeHackerCommand(command, 
        `Previous commands:\n${JSON.stringify(sessionHistory.slice(-3))}`
      );

      // Update UI and state
      await addThought(thought);
      await simulateTyping(command);
      await streamOutput(output);
      
      setSessionHistory(prev => [...prev, { command, output, thought }]);
      
      // Check for compromise
      if (output.includes("root access") || 
          output.includes("credentials found")) {
        await streamOutput("\n\nPWNED! -by Cyber Samurai\n");
        isSystemPwned = true;
      }

      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  } catch (error) {
    console.error("Session Error:", error);
    if (retryCount < 3) {
      setTimeout(() => progressHackerSession(retryCount + 1), 5000);
    } else {
      await streamOutput("\n\n[!] Critical failure. Rebooting session...");
      setTimeout(initializeHackerSim, 10000);
    }
  }
};
// 

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