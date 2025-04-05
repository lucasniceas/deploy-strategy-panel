# Deploy Strategy Panel

A lightweight, dynamic frontend panel to configure and deploy trading strategies integrated with a FastAPI-based Webhook Service.

## 🧩 Project Overview

This project provides a user-friendly web interface to:

- Select trading strategy details (broker, model, runtime, etc.)
- Dynamically render broker credential fields based on the selected broker
- Configure CPU and memory resource allocation
- Submit payloads to a backend webhook that can trigger Kubernetes deployments

## 🚀 Technologies Used

- **Frontend**: Next.js + TypeScript + Tailwind CSS
- **UI Kit**: ShadCN UI
- **Backend (Webhook Service)**: FastAPI + Pydantic

## 📦 Installation

```bash
# Install frontend dependencies
pnpm install

# Run frontend on localhost:3000
pnpm dev

# (In a separate terminal) Activate your Python virtualenv
# Then run backend on localhost:8000
uvicorn main:app --reload --port 8000
```
📤 Payload Example
{
  "strategyName": "my-trading-strategy",
  "broker": "binance",
  "cpu": "1000",
  "memory": "2Gi",
  "command": "python main.py",
  "modelPath": "/models/ppo-straddle-v1.pth",
  "binance-api-key": "your-api-key",
  "binance-api-secret": "your-secret"
}

✅ Status
	•	✔️ UI and webhook fully integrated
	•	✔️ Broker-specific fields rendered dynamically
	•	✔️ Payload validated and received by FastAPI backend

🧠 Future Improvements
	•	Integration with Kubernetes deployment engine
	•	Add support for more brokers and environments
	•	Store configurations in a database

⸻

📌 Note: This repository is used for development and preview purposes. Final version will be hosted on GitLab.

⸻

Author: Lucas Nicéas
