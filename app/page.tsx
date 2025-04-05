import { DeployStrategyForm } from "@/components/deploy-strategy-form"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-3xl">
        <h1 className="mb-6 text-center text-2xl font-bold text-white sm:text-3xl">Strategy Deployment Dashboard</h1>
        <DeployStrategyForm />
      </div>
    </main>
  )
}

