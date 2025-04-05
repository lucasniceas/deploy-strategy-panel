"use client"

import { useEffect } from "react"

export function DisableAssistant() {
  useEffect(() => {
    // Function to remove the assistant button
    const removeAssistant = () => {
      // Common selectors for assistant widgets
      const selectors = [
        "#assistant-button",
        ".assistant-widget",
        ".chat-widget-container",
        ".support-button",
        ".help-widget",
        ".intercom-launcher",
        ".drift-widget",
        ".crisp-client",
        ".freshchat-widget",
        ".tawk-widget",
      ]

      // Try to find and remove each possible element
      selectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector)
        elements.forEach((el) => el.remove())
      })

      // Also try to remove by ID if specific ID is known
      const assistantElement = document.getElementById("assistant-button")
      if (assistantElement) {
        assistantElement.remove()
      }
    }

    // Run immediately
    removeAssistant()

    // Also set up a MutationObserver to catch dynamically added elements
    const observer = new MutationObserver((mutations) => {
      removeAssistant()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => observer.disconnect()
  }, [])

  return null
}

