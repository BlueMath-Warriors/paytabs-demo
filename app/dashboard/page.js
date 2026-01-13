import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session) {
    return null
  }

  const credentialsCount = await prisma.credential.count({
    where: { userId: session.user.id }
  })

  const webhookLogsCount = await prisma.webhookLog.count({
    where: { userId: session.user.id }
  })

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-black dark:text-zinc-50">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold mb-2 text-black dark:text-zinc-50">
            API Credentials
          </h2>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {credentialsCount}
          </p>
          <Link
            href="/dashboard/credentials"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Manage credentials →
          </Link>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold mb-2 text-black dark:text-zinc-50">
            Webhook Logs
          </h2>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
            {webhookLogsCount}
          </p>
          <Link
            href="/dashboard/webhooks"
            className="text-sm text-green-600 dark:text-green-400 hover:underline"
          >
            View logs →
          </Link>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold mb-2 text-black dark:text-zinc-50">
            Quick Actions
          </h2>
          <div className="space-y-2">
            <Link
              href="/dashboard/paylinks"
              className="block text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Create PayLink →
            </Link>
            <Link
              href="/dashboard/credentials"
              className="block text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Add API Credentials →
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow border border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">
          Getting Started
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-zinc-700 dark:text-zinc-300">
          <li>Add your PayTabs API credentials (Server Key and Profile ID)</li>
          <li>Create PayLinks for your customers</li>
          <li>Monitor webhook notifications in the logs</li>
        </ol>
      </div>
    </div>
  )
}
