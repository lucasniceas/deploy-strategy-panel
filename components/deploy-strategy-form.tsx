"use client"

import type React from "react"

import { useState } from "react"
import { Check, ChevronsUpDown, Loader2, Plus, Trash2, X } from "lucide-react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"

const brokers = [
  { value: "ibkr", label: "Interactive Brokers (IBKR)" },
  { value: "binance", label: "Binance" },
  { value: "kraken", label: "Kraken" },
]

const modelPaths = [
  { value: "/models/ppo-straddle-v1.pth", label: "/models/ppo-straddle-v1.pth" },
  { value: "/models/a2c-meanrev-v2.pth", label: "/models/a2c-meanrev-v2.pth" },
  { value: "/models/dqn-trend-v3.pth", label: "/models/dqn-trend-v3.pth" },
]

const modes = [
  { value: "backtest", label: "Backtest" },
  { value: "paper", label: "Paper" },
  { value: "live", label: "Live" },
]

const nodes = [
  { value: "us-east-1a", label: "us-east-1a" },
  { value: "ny4", label: "ny4" },
  { value: "ldn2", label: "ldn2" },
]

const runtimes = [
  { value: "python", label: "Python" },
  { value: "nodejs", label: "Node.js" },
  { value: "go", label: "Go" },
  { value: "java", label: "Java" },
]

const ibkrEnvironments = [
  { value: "paper", label: "Paper Trading" },
  { value: "live", label: "Live Trading" },
]

const krakenVerificationTiers = [
  { value: "starter", label: "Starter" },
  { value: "intermediate", label: "Intermediate" },
  { value: "pro", label: "Pro" },
]

type Volume = {
  name: string
  mountPath: string
}

type EnvVar = {
  key: string
  value: string
}

export function DeployStrategyForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    strategyName: "",
    broker: "",
    modelPath: "",
    command: "python main.py",
    mode: "",
    node: "",
    runtime: "",
    nodeSelector: "",
    cpu: "500",
    memory: "512Mi",
    arguments: [""],
    volumes: [{ name: "", mountPath: "" }] as Volume[],
    envVars: [{ key: "", value: "" }] as EnvVar[],
    credentials: {
      // IBKR credentials
      "ib-user-name": "",
      "ib-password": "",
      "ib-account": "",

      // Binance credentials
      "binance-api-key": "",
      "binance-api-secret": "",

      // Kraken credentials
      "kraken-api-key": "",
      "kraken-api-secret": "",
      "kraken-verification-tier": "starter", // Default value
    },
  })

  const [openStates, setOpenStates] = useState({
    broker: false,
    modelPath: false,
    mode: false,
    node: false,
    runtime: false,
    "kraken-verification-tier": false,
  })

  const toggleOpen = (field: keyof typeof openStates) => {
    setOpenStates((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const handleSelectChange = (field: string, value: string) => {
    if (field.includes("credentials.")) {
      const [_, credentialField] = field.split(".")
      setFormData((prev) => ({
        ...prev,
        credentials: {
          ...prev.credentials,
          [credentialField]: value,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }

    // Close the popover if it's in our openStates
    if (field in openStates || field === "credentials.ibkr_environment") {
      toggleOpen(field === "credentials.ibkr_environment" ? "ibkr_environment" : (field as keyof typeof openStates))
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name.includes("credentials.")) {
      const [_, credentialField] = name.split(".")
      setFormData((prev) => ({
        ...prev,
        credentials: {
          ...prev.credentials,
          [credentialField]: value,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  // Handle argument list changes
  const handleArgumentChange = (index: number, value: string) => {
    const newArguments = [...formData.arguments]
    newArguments[index] = value
    setFormData((prev) => ({ ...prev, arguments: newArguments }))
  }

  const addArgument = () => {
    setFormData((prev) => ({ ...prev, arguments: [...prev.arguments, ""] }))
  }

  const removeArgument = (index: number) => {
    const newArguments = [...formData.arguments]
    newArguments.splice(index, 1)
    setFormData((prev) => ({ ...prev, arguments: newArguments }))
  }

  // Handle volume list changes
  const handleVolumeChange = (index: number, field: keyof Volume, value: string) => {
    const newVolumes = [...formData.volumes]
    newVolumes[index] = { ...newVolumes[index], [field]: value }
    setFormData((prev) => ({ ...prev, volumes: newVolumes }))
  }

  const addVolume = () => {
    setFormData((prev) => ({
      ...prev,
      volumes: [...prev.volumes, { name: "", mountPath: "" }],
    }))
  }

  const removeVolume = (index: number) => {
    const newVolumes = [...formData.volumes]
    newVolumes.splice(index, 1)
    setFormData((prev) => ({ ...prev, volumes: newVolumes }))
  }

  // Handle environment variable list changes
  const handleEnvVarChange = (index: number, field: keyof EnvVar, value: string) => {
    const newEnvVars = [...formData.envVars]
    newEnvVars[index] = { ...newEnvVars[index], [field]: value }
    setFormData((prev) => ({ ...prev, envVars: newEnvVars }))
  }

  const addEnvVar = () => {
    setFormData((prev) => ({
      ...prev,
      envVars: [...prev.envVars, { key: "", value: "" }],
    }))
  }

  const removeEnvVar = (index: number) => {
    const newEnvVars = [...formData.envVars]
    newEnvVars.splice(index, 1)
    setFormData((prev) => ({ ...prev, envVars: newEnvVars }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const requiredFields = [
      "strategyName",
      "broker",
      "modelPath",
      "command",
      "mode",
      "node",
      "runtime",
      "cpu",
      "memory",
    ]
    const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData])

    // Validate broker-specific credentials
    const missingCredentials: string[] = []
    if (formData.broker === "ibkr") {
      if (!formData.credentials["ib-user-name"]) missingCredentials.push("IBKR Username")
      if (!formData.credentials["ib-password"]) missingCredentials.push("IBKR Password")
      if (!formData.credentials["ib-account"]) missingCredentials.push("IBKR Account")
    } else if (formData.broker === "binance") {
      if (!formData.credentials["binance-api-key"]) missingCredentials.push("Binance API Key")
      if (!formData.credentials["binance-api-secret"]) missingCredentials.push("Binance API Secret")
    } else if (formData.broker === "kraken") {
      if (!formData.credentials["kraken-api-key"]) missingCredentials.push("Kraken API Key")
      if (!formData.credentials["kraken-api-secret"]) missingCredentials.push("Kraken API Secret")
      if (!formData.credentials["kraken-verification-tier"]) missingCredentials.push("Kraken Verification Tier")
    }

    if (missingFields.length > 0 || missingCredentials.length > 0) {
      let errorMessage = ""
      if (missingFields.length > 0) {
        errorMessage += `Please fill in all required fields: ${missingFields.join(", ")}`
      }
      if (missingCredentials.length > 0) {
        errorMessage += errorMessage ? "\n\n" : ""
        errorMessage += `Please provide all required credentials: ${missingCredentials.join(", ")}`
      }

      toast({
        title: "Validation Error",
        description: errorMessage,
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Format the payload according to the required structure
      const payload = {
        strategyName: formData.strategyName,
        broker: formData.broker,
        cpu: formData.cpu,
        memory: formData.memory,
      }

      // Add broker-specific credentials to the payload
      if (formData.broker === "binance") {
        Object.assign(payload, {
          "binance-api-key": formData.credentials["binance-api-key"],
          "binance-api-secret": formData.credentials["binance-api-secret"],
        })
      } else if (formData.broker === "ibkr") {
        Object.assign(payload, {
          "ib-user-name": formData.credentials["ib-user-name"],
          "ib-password": formData.credentials["ib-password"],
          "ib-account": formData.credentials["ib-account"],
        })
      } else if (formData.broker === "kraken") {
        Object.assign(payload, {
          "kraken-api-key": formData.credentials["kraken-api-key"],
          "kraken-api-secret": formData.credentials["kraken-api-secret"],
          "kraken-verification-tier": formData.credentials["kraken-verification-tier"],
        })
      }

      // Add other required fields
      Object.assign(payload, {
        modelPath: formData.modelPath,
        command: formData.command,
        mode: formData.mode,
        node: formData.node,
        runtime: formData.runtime,
      })

      console.log("Submitting payload:", payload)

      const response = await fetch("http://localhost:8000/webhook/trigger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Failed to deploy strategy")
      }

      toast({
        title: "Strategy Deployed",
        description: "Your trading strategy has been successfully deployed.",
      })
    } catch (error) {
      toast({
        title: "Deployment Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render broker-specific credential fields
  const renderCredentialFields = () => {
    if (!formData.broker) return null

    return (
      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-300">Broker Credentials</h3>

        {formData.broker === "ibkr" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="credentials.ib-user-name" className="text-gray-300">
                Username
              </Label>
              <Input
                id="credentials.ib-user-name"
                name="credentials.ib-user-name"
                value={formData.credentials["ib-user-name"]}
                onChange={handleInputChange}
                className="border-gray-700 bg-gray-900 text-gray-300 focus-visible:ring-gray-700"
                placeholder="Your IBKR Username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="credentials.ib-password" className="text-gray-300">
                Password
              </Label>
              <Input
                id="credentials.ib-password"
                name="credentials.ib-password"
                type="password"
                value={formData.credentials["ib-password"]}
                onChange={handleInputChange}
                className="border-gray-700 bg-gray-900 text-gray-300 focus-visible:ring-gray-700"
                placeholder="Your IBKR Password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="credentials.ib-account" className="text-gray-300">
                Account
              </Label>
              <Input
                id="credentials.ib-account"
                name="credentials.ib-account"
                value={formData.credentials["ib-account"]}
                onChange={handleInputChange}
                className="border-gray-700 bg-gray-900 text-gray-300 focus-visible:ring-gray-700"
                placeholder="Your IBKR Account"
              />
            </div>
          </div>
        )}

        {formData.broker === "binance" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="credentials.binance-api-key" className="text-gray-300">
                API Key
              </Label>
              <Input
                id="credentials.binance-api-key"
                name="credentials.binance-api-key"
                value={formData.credentials["binance-api-key"]}
                onChange={handleInputChange}
                className="border-gray-700 bg-gray-900 text-gray-300 focus-visible:ring-gray-700"
                placeholder="Your Binance API Key"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="credentials.binance-api-secret" className="text-gray-300">
                API Secret
              </Label>
              <Input
                id="credentials.binance-api-secret"
                name="credentials.binance-api-secret"
                type="password"
                value={formData.credentials["binance-api-secret"]}
                onChange={handleInputChange}
                className="border-gray-700 bg-gray-900 text-gray-300 focus-visible:ring-gray-700"
                placeholder="Your Binance API Secret"
              />
            </div>
          </div>
        )}

        {formData.broker === "kraken" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="credentials.kraken-api-key" className="text-gray-300">
                API Key
              </Label>
              <Input
                id="credentials.kraken-api-key"
                name="credentials.kraken-api-key"
                value={formData.credentials["kraken-api-key"]}
                onChange={handleInputChange}
                className="border-gray-700 bg-gray-900 text-gray-300 focus-visible:ring-gray-700"
                placeholder="Your Kraken API Key"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="credentials.kraken-api-secret" className="text-gray-300">
                API Secret
              </Label>
              <Input
                id="credentials.kraken-api-secret"
                name="credentials.kraken-api-secret"
                type="password"
                value={formData.credentials["kraken-api-secret"]}
                onChange={handleInputChange}
                className="border-gray-700 bg-gray-900 text-gray-300 focus-visible:ring-gray-700"
                placeholder="Your Kraken API Secret"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="credentials.kraken-verification-tier" className="text-gray-300">
                Verification Tier
              </Label>
              <Popover
                open={openStates["kraken-verification-tier"]}
                onOpenChange={() => toggleOpen("kraken-verification-tier" as keyof typeof openStates)}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openStates["kraken-verification-tier"]}
                    className="w-full justify-between border-gray-700 bg-gray-900 text-gray-300 hover:bg-gray-800"
                  >
                    {formData.credentials["kraken-verification-tier"]
                      ? krakenVerificationTiers.find(
                          (tier) => tier.value === formData.credentials["kraken-verification-tier"],
                        )?.label
                      : "Select verification tier..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full border-gray-700 bg-gray-900 p-0">
                  <Command className="bg-gray-900">
                    <CommandInput placeholder="Search tier..." className="text-gray-300" />
                    <CommandList>
                      <CommandEmpty className="text-gray-400">No tier found.</CommandEmpty>
                      <CommandGroup>
                        {krakenVerificationTiers.map((tier) => (
                          <CommandItem
                            key={tier.value}
                            value={tier.value}
                            onSelect={() => handleSelectChange("credentials.kraken-verification-tier", tier.value)}
                            className="text-gray-300 aria-selected:bg-gray-800"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.credentials["kraken-verification-tier"] === tier.value
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {tier.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="border-gray-800 bg-gray-950 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-white">Deploy Trading Strategy</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 max-h-[70vh] overflow-y-auto pr-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-300">Basic Information</h3>

            <div className="space-y-2">
              <Label htmlFor="strategyName" className="text-gray-300">
                Strategy Name
              </Label>
              <Input
                id="strategyName"
                name="strategyName"
                value={formData.strategyName}
                onChange={handleInputChange}
                className="border-gray-700 bg-gray-900 text-gray-300 focus-visible:ring-gray-700"
                placeholder="my-trading-strategy"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="broker" className="text-gray-300">
                Broker
              </Label>
              <Popover open={openStates.broker} onOpenChange={() => toggleOpen("broker")}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openStates.broker}
                    className="w-full justify-between border-gray-700 bg-gray-900 text-gray-300 hover:bg-gray-800"
                  >
                    {formData.broker
                      ? brokers.find((broker) => broker.value === formData.broker)?.label
                      : "Select broker..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full border-gray-700 bg-gray-900 p-0">
                  <Command className="bg-gray-900">
                    <CommandInput placeholder="Search broker..." className="text-gray-300" />
                    <CommandList>
                      <CommandEmpty className="text-gray-400">No broker found.</CommandEmpty>
                      <CommandGroup>
                        {brokers.map((broker) => (
                          <CommandItem
                            key={broker.value}
                            value={broker.value}
                            onSelect={() => handleSelectChange("broker", broker.value)}
                            className="text-gray-300 aria-selected:bg-gray-800"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.broker === broker.value ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {broker.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelPath" className="text-gray-300">
                Model Path
              </Label>
              <Popover open={openStates.modelPath} onOpenChange={() => toggleOpen("modelPath")}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openStates.modelPath}
                    className="w-full justify-between border-gray-700 bg-gray-900 text-gray-300 hover:bg-gray-800"
                  >
                    {formData.modelPath
                      ? modelPaths.find((model) => model.value === formData.modelPath)?.label
                      : "Select model path..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full border-gray-700 bg-gray-900 p-0">
                  <Command className="bg-gray-900">
                    <CommandInput placeholder="Search model..." className="text-gray-300" />
                    <CommandList>
                      <CommandEmpty className="text-gray-400">No model found.</CommandEmpty>
                      <CommandGroup>
                        {modelPaths.map((model) => (
                          <CommandItem
                            key={model.value}
                            value={model.value}
                            onSelect={() => handleSelectChange("modelPath", model.value)}
                            className="text-gray-300 aria-selected:bg-gray-800"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.modelPath === model.value ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {model.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Render broker-specific credential fields if a broker is selected */}
          {formData.broker && (
            <>
              <Separator className="bg-gray-800" />
              {renderCredentialFields()}
            </>
          )}

          <Separator className="bg-gray-800" />

          {/* Runtime Configuration Section */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-300">Runtime Configuration</h3>

            <div className="space-y-2">
              <Label htmlFor="runtime" className="text-gray-300">
                Runtime
              </Label>
              <Popover open={openStates.runtime} onOpenChange={() => toggleOpen("runtime")}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openStates.runtime}
                    className="w-full justify-between border-gray-700 bg-gray-900 text-gray-300 hover:bg-gray-800"
                  >
                    {formData.runtime
                      ? runtimes.find((runtime) => runtime.value === formData.runtime)?.label
                      : "Select runtime..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full border-gray-700 bg-gray-900 p-0">
                  <Command className="bg-gray-900">
                    <CommandInput placeholder="Search runtime..." className="text-gray-300" />
                    <CommandList>
                      <CommandEmpty className="text-gray-400">No runtime found.</CommandEmpty>
                      <CommandGroup>
                        {runtimes.map((runtime) => (
                          <CommandItem
                            key={runtime.value}
                            value={runtime.value}
                            onSelect={() => handleSelectChange("runtime", runtime.value)}
                            className="text-gray-300 aria-selected:bg-gray-800"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.runtime === runtime.value ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {runtime.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mode" className="text-gray-300">
                Mode
              </Label>
              <Popover open={openStates.mode} onOpenChange={() => toggleOpen("mode")}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openStates.mode}
                    className="w-full justify-between border-gray-700 bg-gray-900 text-gray-300 hover:bg-gray-800"
                  >
                    {formData.mode ? modes.find((mode) => mode.value === formData.mode)?.label : "Select mode..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full border-gray-700 bg-gray-900 p-0">
                  <Command className="bg-gray-900">
                    <CommandInput placeholder="Search mode..." className="text-gray-300" />
                    <CommandList>
                      <CommandEmpty className="text-gray-400">No mode found.</CommandEmpty>
                      <CommandGroup>
                        {modes.map((mode) => (
                          <CommandItem
                            key={mode.value}
                            value={mode.value}
                            onSelect={() => handleSelectChange("mode", mode.value)}
                            className="text-gray-300 aria-selected:bg-gray-800"
                          >
                            <Check
                              className={cn("mr-2 h-4 w-4", formData.mode === mode.value ? "opacity-100" : "opacity-0")}
                            />
                            {mode.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="node" className="text-gray-300">
                Node Label / Execution Zone
              </Label>
              <Popover open={openStates.node} onOpenChange={() => toggleOpen("node")}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openStates.node}
                    className="w-full justify-between border-gray-700 bg-gray-900 text-gray-300 hover:bg-gray-800"
                  >
                    {formData.node ? nodes.find((node) => node.value === formData.node)?.label : "Select node..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full border-gray-700 bg-gray-900 p-0">
                  <Command className="bg-gray-900">
                    <CommandInput placeholder="Search node..." className="text-gray-300" />
                    <CommandList>
                      <CommandEmpty className="text-gray-400">No node found.</CommandEmpty>
                      <CommandGroup>
                        {nodes.map((node) => (
                          <CommandItem
                            key={node.value}
                            value={node.value}
                            onSelect={() => handleSelectChange("node", node.value)}
                            className="text-gray-300 aria-selected:bg-gray-800"
                          >
                            <Check
                              className={cn("mr-2 h-4 w-4", formData.node === node.value ? "opacity-100" : "opacity-0")}
                            />
                            {node.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nodeSelector" className="text-gray-300">
                Node Selector
              </Label>
              <Input
                id="nodeSelector"
                name="nodeSelector"
                value={formData.nodeSelector}
                onChange={handleInputChange}
                className="border-gray-700 bg-gray-900 text-gray-300 focus-visible:ring-gray-700"
                placeholder="gpu=true,region=us-east"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cpu" className="text-gray-300">
                  CPU (millicores)
                </Label>
                <Input
                  id="cpu"
                  name="cpu"
                  type="number"
                  value={formData.cpu}
                  onChange={handleInputChange}
                  className="border-gray-700 bg-gray-900 text-gray-300 focus-visible:ring-gray-700"
                  placeholder="500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="memory" className="text-gray-300">
                  Memory
                </Label>
                <Input
                  id="memory"
                  name="memory"
                  value={formData.memory}
                  onChange={handleInputChange}
                  className="border-gray-700 bg-gray-900 text-gray-300 focus-visible:ring-gray-700"
                  placeholder="512Mi"
                />
              </div>
            </div>
          </div>

          <Separator className="bg-gray-800" />

          {/* Command and Arguments Section */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-300">Command and Arguments</h3>

            <div className="space-y-2">
              <Label htmlFor="command" className="text-gray-300">
                Command
              </Label>
              <Textarea
                id="command"
                name="command"
                value={formData.command}
                onChange={handleInputChange}
                className="min-h-[80px] border-gray-700 bg-gray-900 text-gray-300 focus-visible:ring-gray-700"
                placeholder="python main.py"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-gray-300">Arguments</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addArgument}
                  className="h-8 border-gray-700 bg-gray-900 text-gray-300 hover:bg-gray-800"
                >
                  <Plus className="mr-1 h-3 w-3" /> Add Argument
                </Button>
              </div>
              <div className="space-y-2">
                {formData.arguments.map((arg, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={arg}
                      onChange={(e) => handleArgumentChange(index, e.target.value)}
                      className="border-gray-700 bg-gray-900 text-gray-300 focus-visible:ring-gray-700"
                      placeholder={`Argument ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArgument(index)}
                      className="h-8 w-8 text-gray-400 hover:text-gray-300 hover:bg-gray-800"
                      disabled={formData.arguments.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator className="bg-gray-800" />

          {/* Volumes Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-medium text-gray-300">Volumes</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addVolume}
                className="h-8 border-gray-700 bg-gray-900 text-gray-300 hover:bg-gray-800"
              >
                <Plus className="mr-1 h-3 w-3" /> Add Volume
              </Button>
            </div>

            <div className="space-y-4">
              {formData.volumes.map((volume, index) => (
                <div key={index} className="rounded-md border border-gray-800 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-400">Volume {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeVolume(index)}
                      className="h-6 w-6 text-gray-400 hover:text-gray-300 hover:bg-gray-800"
                      disabled={formData.volumes.length <= 1}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`volume-name-${index}`} className="text-gray-300">
                      Volume Name
                    </Label>
                    <Input
                      id={`volume-name-${index}`}
                      value={volume.name}
                      onChange={(e) => handleVolumeChange(index, "name", e.target.value)}
                      className="border-gray-700 bg-gray-900 text-gray-300 focus-visible:ring-gray-700"
                      placeholder="data-volume"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`volume-path-${index}`} className="text-gray-300">
                      Mount Path
                    </Label>
                    <Input
                      id={`volume-path-${index}`}
                      value={volume.mountPath}
                      onChange={(e) => handleVolumeChange(index, "mountPath", e.target.value)}
                      className="border-gray-700 bg-gray-900 text-gray-300 focus-visible:ring-gray-700"
                      placeholder="/app/data"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-gray-800" />

          {/* Environment Variables Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-medium text-gray-300">Environment Variables</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addEnvVar}
                className="h-8 border-gray-700 bg-gray-900 text-gray-300 hover:bg-gray-800"
              >
                <Plus className="mr-1 h-3 w-3" /> Add Variable
              </Button>
            </div>

            <div className="space-y-4">
              {formData.envVars.map((envVar, index) => (
                <div key={index} className="rounded-md border border-gray-800 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-400">Environment Variable {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEnvVar(index)}
                      className="h-6 w-6 text-gray-400 hover:text-gray-300 hover:bg-gray-800"
                      disabled={formData.envVars.length <= 1}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`env-key-${index}`} className="text-gray-300">
                        Key
                      </Label>
                      <Input
                        id={`env-key-${index}`}
                        value={envVar.key}
                        onChange={(e) => handleEnvVarChange(index, "key", e.target.value)}
                        className="border-gray-700 bg-gray-900 text-gray-300 focus-visible:ring-gray-700"
                        placeholder="API_KEY"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`env-value-${index}`} className="text-gray-300">
                        Value
                      </Label>
                      <Input
                        id={`env-value-${index}`}
                        value={envVar.value}
                        onChange={(e) => handleEnvVarChange(index, "value", e.target.value)}
                        className="border-gray-700 bg-gray-900 text-gray-300 focus-visible:ring-gray-700"
                        placeholder="your-api-key"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deploying...
              </>
            ) : (
              "Deploy Strategy"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

