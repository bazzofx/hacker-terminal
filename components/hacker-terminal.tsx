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
// custom drop down buttons
const [selectedTarget, setSelectedTarget] = useState("Linux");
const [isDropdownOpen, setIsDropdownOpen] = useState(false);
const dropdownRef = useRef<HTMLDivElement>(null);
const targets = ["Active Directory", "Linux", "Windows 11", "Microsoft Azure Tenant", "Amazon AWS"];
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

   // Custom Dropdown Component
   const TargetDropdown = () => (
    <div className="relative" ref={dropdownRef}>
      <Button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="bg-[#33ff33]/10 text-[#33ff33] border border-[#33ff33]/50 font-mono text-sm hover:bg-[#33ff33]/20"
      >
        Target: {selectedTarget} ▼
      </Button>
      
      {isDropdownOpen && (
        <div className="absolute z-10 mt-1 w-full bg-[#0a0a0a] border border-[#33ff33]/50 rounded-md shadow-lg">
          {targets.map((target) => (
            <button
              key={target}
              className={`block w-full text-left px-4 py-2 text-sm font-mono ${
                selectedTarget === target
                  ? "bg-[#33ff33]/20 text-[#33ff33]"
                  : "text-[#33ff33]/80 hover:bg-[#33ff33]/10"
              }`}
              onClick={() => {
                setSelectedTarget(target);
                setIsDropdownOpen(false);
                updateApiStatus(`Target changed to: ${target}`);
              }}
            >
              {target}
            </button>
          ))}
        </div>
      )}
    </div>
  );


// Drop down choice

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
          thoughtLogRef.current.textContent += '\n\n'
          thoughtLogRef.current.scrollTop = thoughtLogRef.current.scrollHeight
          setIsThoughtStreaming(false)
          if (pendingGodModeCommand) {
            addGodModeThought(pendingGodModeCommand)
            setPendingGodModeCommand(null)
          }
        }
      }, 20)
    },
    [pendingGodModeCommand]
  )

  const addGodModeThought = useCallback((command: string) => {
    if (!thoughtLogRef.current) return
    const thought = `[GodMode Command: ${command}]`
    thoughtLogRef.current.textContent += `\n${thought}\n\n`
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
    [soundEnabled]
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
      updateApiStatus(`Waiting ${timeToWait / 500} seconds before next action`)
      await new Promise((resolve) => setTimeout(resolve, timeToWait))
    }

    const maxApiCallsPerFiveMinutes = 20
    if (apiCallCount >= maxApiCallsPerFiveMinutes) {
      const waitTime = 60000 // 1 minute
      updateApiStatus(`Rate limit reached. Taking a short break.`)
      await addThought("Hmm, I've been going pretty fast. Maybe I should take a quick break...")
      await new Promise((resolve) => setTimeout(resolve, waitTime))
      setApiCallCount(0)
      await addThought("Alright, break's over. Ready for next command.")
    }

    setLastApiCall(Date.now())
    setApiCallCount((prev) => prev + 1)

    setTimeout(() => {
      setApiCallCount(0)
    }, 300000)
  }




const apiDeepSeek = process.env.NEXT_PUBLIC_APIDEEPSEEK

  const executeCommand = async (command: string) => {
    let isSystemPwned = false;

    const simulateCommandOutput = async (cmd: string, context: string) => {
      await waitForNextCallWindow();
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiDeepSeek}`,
        },

        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: `Simulate realistic ${selectedTarget} command output for penetration testing. The server should not have default credentials but have vulnerabilities that can be exploited, after a little bit of struggle. Command: ${cmd}`
            },
            {
              role: "user",
              content: context
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        })
      });
      return (await response.json()).choices[0].message.content;
    };

    try {
      const thought = `Executing: ${command}`;
      const output = await simulateCommandOutput(
        command,
        `Session history:\n${JSON.stringify(sessionHistory.slice(-3), null, 2)}`
      );

      await addThought(thought);
      await simulateTyping(command);
      await streamOutput(output);
      
      setSessionHistory(prev => [
        ...prev,
        {
          command,
          output,
          thought,
          godmode_influence: command
        }
      ]);

      if (output.includes("root access gained") || output.includes("credentials found")) {
        await streamOutput("\n\nPWNED! -by Cyber Samurai\n");
        isSystemPwned = true;
      }

      return isSystemPwned;

    } catch (error) {
      console.error("Command error:", error);
      await streamOutput(`\n\n[!] Command failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      return false;
    }
  };

  const initializeHackerSim = useCallback(async () => {
    updateApiStatus("HackerSim initialized. Awaiting commands.");
    const initialContent = `Welcome to Ubuntu 22.04.2 LTS (GNU/Linux 5.15.0-72-generic x86_64)
 System Design by CyberSamurai - cybersamurai.co.uk - 2025

* Documentation: https://help.ubuntu.com
* Management: https://landscape.canonical.com  
* Support: https://ubuntu.com/advantage

System ready. Awaiting your commands...`;

    if (terminalRef.current) {
      terminalRef.current.innerHTML = initialContent;
      showInputLine();
    }

    setSessionHistory([{
      command: "",
      output: initialContent,
      thought: "System initialized. Ready for commands.",
      godmode_influence: ""
    }]);

    await addThought("System initialized. Ready for commands.");
  }, [addThought, showInputLine]);

  const submitGodmodeCommand = async () => {
    if (!godmodeInputRef.current) return;

    const command = godmodeInputRef.current.value.trim();
    if (command) {
      setGodmodeCommand(command);
      godmodeInputRef.current.value = "";
      
      updateApiStatus(`Executing: ${command}`);
      addGodModeThought(command);

      const wasPwned = await executeCommand(command);

      toast({
        title: wasPwned ? "System Compromised!" : "Command Executed",
        description: wasPwned 
          ? "Target system fully pwned!" 
          : "Ready for next command",
      });

      if (wasPwned) {
        godmodeInputRef.current.disabled = true;
      }
    }
  };

  const handleGodmodeKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitGodmodeCommand();
    }
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  const toggleApiStatus = () => {
    setShowApiStatus((prev) => !prev);
  };

  useEffect(() => {
    typingSound1Ref.current = new Audio(
      "https://cdn.pixabay.com/download/audio/2022/03/24/audio_ef3fa634de.mp3?filename=keyboard-spacebar-hit-101812.mp3",
    );
    typingSound2Ref.current = new Audio(
      "https://cdn.pixabay.com/download/audio/2022/03/15/audio_bca2811b06.mp3?filename=keyboard5-88069.mp3",
    );

    if (!isInitialized) {
      initializeHackerSim();
      setIsInitialized(true);
    }

    return () => {
      if (typingSound1Ref.current) {
        typingSound1Ref.current.pause();
        typingSound1Ref.current = null;
      }
      if (typingSound2Ref.current) {
        typingSound2Ref.current.pause();
        typingSound2Ref.current = null;
      }
    };
  }, [isInitialized, initializeHackerSim]);

  return (

    <div className="p-4 lg:p-6 min-h-screen font-mono bg-[#0a0a0a] text-[#33ff33]">
    <div className="main-container flex flex-col h-screen p-5 box-border bg-gradient-to-br from-black to-[#0a0a0a] bg-fixed">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-[#00ff00] text-shadow-glow text-2xl md:text-3xl font-medium tracking-wider">
        優秀 Cyber Samurai - Interactive Penetration Testing 
        </h1>
        {/* <TargetDropdown /> */}
        </div>

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
                placeholder="How should we proceed with our attack? (e.g. 'Check for open ports')"
                className="bg-[#001f1f]/70 text-[#00ffff] border border-[#00ffff]/50 p-3 mb-3 resize-y w-full font-mono text-sm rounded-md transition-all duration-300 focus:shadow-[0_0_10px_rgba(0,255,255,0.5)] focus:outline-none backdrop-blur-md"
                rows={3}
                onKeyDown={handleGodmodeKeyDown}
              />
              <Button
                id="godmode-submit"
                onClick={submitGodmodeCommand}
                className="bg-[#00ffff]/20 text-[#00ffff] border border-[#00ffff]/50 p-2 cursor-pointer font-mono font-bold rounded-md transition-all duration-300 hover:bg-[#00ffff]/40 hover:shadow-[0_0_10px_rgba(0,255,255,0.5)] backdrop-blur-md"
              >
                Execute Command
              </Button>
            </div>
          </div>
        </div>

        {showApiStatus && (
          <div
            ref={apiStatusRef}
            id="api-status"
            className="bg-black/70 text-[#00ffff] p-3 text-xs h-[100px] overflow-y-auto mt-4 rounded-md border border-[#00ffff]/50 backdrop-blur-md">
            <div className="font-bold mb-1">DEBUG LOG:</div>
          </div>
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

        <TargetDropdown />

      </div>

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