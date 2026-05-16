import React from 'react'

import { motion, AnimatePresence } from 'framer-motion'

import {
  Shield,
  Activity,
  AlertTriangle,
  Server,
  Globe,
  Settings,
  BarChart3,
  Wifi,
  CheckCircle2,
  Radar,
} from 'lucide-react'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

const severityColors = {
  CRITICAL: 'bg-red-500/20 text-red-300 border-red-500/30',
  HIGH: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  MEDIUM: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  LOW: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
}

const pieColors = [
  '#38bdf8',
  '#f472b6',
  '#818cf8',
  '#34d399',
  '#facc15',
]

function SidebarItem({
  icon: Icon,
  label,
  active,
}) {

  return (

    <div
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-all cursor-pointer border ${active
        ? 'bg-gradient-to-r from-pink-500/20 to-cyan-500/20 border-cyan-400/20 text-white shadow-lg shadow-cyan-500/10'
        : 'border-transparent hover:bg-slate-800/70 text-slate-400 hover:text-white'
        }`}
    >

      <Icon size={20} />

      <span className="font-medium">
        {label}
      </span>

    </div>
  )
}

function StatCard({
  icon: Icon,
  title,
  value,
  glow,
}) {

  return (

    <motion.div
      whileHover={{ y: -4 }}
      className={`rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 shadow-2xl ${glow}`}
    >

      <div className="flex items-center justify-between mb-4">

        <div>

          <p className="text-slate-400 text-sm">
            {title}
          </p>

          <h3 className="text-4xl font-bold mt-2">
            {value}
          </h3>

        </div>

        <div className="rounded-2xl bg-white/5 p-4 border border-white/10">

          <Icon
            className="text-cyan-300"
            size={28}
          />

        </div>

      </div>

      <div className="h-1 rounded-full bg-gradient-to-r from-pink-400 via-cyan-400 to-blue-500" />

    </motion.div>
  )
}

export default function App() {

  const [alerts, setAlerts] =
    React.useState([])

  const [loading, setLoading] =
    React.useState(true)

  const [connected, setConnected] =
    React.useState(false)

  const [attackers, setAttackers] =
    React.useState([])

  const [trafficAnalytics, setTrafficAnalytics] =
    React.useState({
      total_requests: 0,
      error_requests: 0,
      unique_ips: 0,
    })

  const [statusCodeAnalytics, setStatusCodeAnalytics] =
    React.useState([])

  React.useEffect(() => {

    fetchAlerts()

    fetchTrafficAnalytics()

    fetchStatusCodeAnalytics()

    fetchAttackers()

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';
    const socket = new WebSocket(`${wsUrl}/ws`);

    socket.onopen = () => {

      console.log(
        '✅ WebSocket connected'
      )

      setConnected(true)
    }

    socket.onmessage = (event) => {

      const parsedData = JSON.parse(event.data)

      setAlerts((prev) => {
        const incomingAlerts = Array.isArray(parsedData) ? parsedData : [parsedData];
        const newAlerts = incomingAlerts.filter(incoming => !prev.some(a => a.id === incoming.id && a.created_at === incoming.created_at));
        if (newAlerts.length === 0) return prev;
        return [...newAlerts, ...prev];
      })

      fetchTrafficAnalytics()

      fetchStatusCodeAnalytics()

      fetchAttackers()
    }

    socket.onerror = (error) => {

      console.error(
        'WebSocket error:',
        error
      )
    }

    socket.onclose = () => {

      console.log(
        '❌ WebSocket disconnected'
      )

      setConnected(false)
    }

    return () => {
      socket.close()
    }

  }, [])

  async function fetchAlerts() {

    try {

      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiBaseUrl}/alerts`, {
          headers: {
            'x-api-key':
              'tenant1-secret-key',
          },
        }
      )

      const data =
        await response.json()

      setAlerts(data)

    } catch (error) {

      console.error(
        'Failed to fetch alerts',
        error
      )

    } finally {

      setLoading(false)
    }
  }

  async function fetchTrafficAnalytics() {

    try {

      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiBaseUrl}/analytics/traffic`);

      const data =
        await response.json()

      setTrafficAnalytics(data)

    } catch (error) {

      console.error(
        'Failed to fetch analytics',
        error
      )
    }
  }

  async function fetchStatusCodeAnalytics() {

    try {

      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiBaseUrl}/analytics/status-codes`);

      const data =
        await response.json()

      const formatted = data.map(
        (item) => ({
          name: `${item.status_code}`,
          value: item.count,
        })
      )

      setStatusCodeAnalytics(
        formatted
      )

    } catch (error) {

      console.error(
        'Failed to fetch status analytics',
        error
      )
    }
  }

  async function fetchAttackers() {

    try {

      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiBaseUrl}/analytics/attackers`);

      const data =
        await response.json()

      setAttackers(data)

    } catch (error) {

      console.error(
        'Failed to fetch attackers',
        error
      )
    }
  }

  const analyticsMap = {}

  alerts.forEach((alert) => {

    const date = new Date(
      alert.created_at
    )

    const hour = `${date.getHours()}:00`

    if (!analyticsMap[hour]) {
      analyticsMap[hour] = 0
    }

    analyticsMap[hour] += 1
  })

  const analyticsData =
    Object.keys(analyticsMap).map(
      (hour) => ({
        time: hour,
        alerts: analyticsMap[hour],
      })
    )

  const successRate = trafficAnalytics.total_requests
    ? Math.round(
      (
        (
          trafficAnalytics.total_requests -
          trafficAnalytics.error_requests
        ) /
        trafficAnalytics.total_requests
      ) * 100
    )
    : 0

  return (

    <div className="min-h-screen bg-[#020617] text-white overflow-hidden">

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.15),transparent_25%),radial-gradient(circle_at_bottom_left,_rgba(244,114,182,0.15),transparent_25%)]" />

      <div className="relative z-10 flex">

        <aside className="w-[280px] min-h-screen border-r border-white/10 bg-slate-950/70 backdrop-blur-2xl p-6 hidden lg:block">

          <div className="flex items-center gap-3 mb-12">

            <div className="rounded-2xl bg-gradient-to-r from-pink-500 to-cyan-500 p-3 shadow-lg shadow-cyan-500/20">

              <Shield size={28} />

            </div>

            <div>

              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-300 to-cyan-300 bg-clip-text text-transparent">
                SentinelX
              </h1>

              <p className="text-slate-400 text-sm">
                Multi-Tenant SIEM
              </p>

            </div>

          </div>

          <div className="space-y-3">

            <SidebarItem
              icon={BarChart3}
              label="Overview"
              active
            />

            <SidebarItem
              icon={AlertTriangle}
              label="Threat Alerts"
            />

            <SidebarItem
              icon={Activity}
              label="Analytics"
            />

            <SidebarItem
              icon={Radar}
              label="Threat Intelligence"
            />

            <SidebarItem
              icon={Server}
              label="Infrastructure"
            />

            <SidebarItem
              icon={Settings}
              label="Settings"
            />

          </div>

        </aside>

        <main className="flex-1 p-8">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">

            <div>

              <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-pink-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">

                Security Operations Center

              </h1>

              <p className="text-slate-400 mt-3 text-lg">

                Real-time observability & threat intelligence.

              </p>

            </div>

            <div
              className={`px-4 py-2 rounded-xl text-sm border flex items-center gap-2 ${connected
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-red-500/20 text-red-300 border-red-500/30'
                }`}
            >

              <Wifi size={16} />

              {connected
                ? 'LIVE STREAM CONNECTED'
                : 'DISCONNECTED'}

            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

            <StatCard
              icon={Globe}
              title="Total Requests"
              value={trafficAnalytics.total_requests}
              glow="shadow-cyan-500/10"
            />

            <StatCard
              icon={AlertTriangle}
              title="Error Requests"
              value={trafficAnalytics.error_requests}
              glow="shadow-pink-500/10"
            />

            <StatCard
              icon={Server}
              title="Unique IPs"
              value={trafficAnalytics.unique_ips}
              glow="shadow-blue-500/10"
            />

            <StatCard
              icon={CheckCircle2}
              title="Success Rate"
              value={`${successRate}%`}
              glow="shadow-emerald-500/10"
            />

          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="xl:col-span-2 rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 shadow-2xl"
            >

              <h2 className="text-2xl font-semibold mb-6">
                Threat Activity
              </h2>

              <div className="h-[320px]">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <AreaChart
                    data={analyticsData}
                  >

                    <defs>

                      <linearGradient
                        id="colorAlerts"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >

                        <stop
                          offset="5%"
                          stopColor="#38bdf8"
                          stopOpacity={0.8}
                        />

                        <stop
                          offset="95%"
                          stopColor="#38bdf8"
                          stopOpacity={0}
                        />

                      </linearGradient>

                    </defs>

                    <CartesianGrid
                      stroke="#1e293b"
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="time"
                      stroke="#94a3b8"
                    />

                    <YAxis
                      stroke="#94a3b8"
                    />

                    <Tooltip />

                    <Area
                      type="monotone"
                      dataKey="alerts"
                      stroke="#38bdf8"
                      fillOpacity={1}
                      fill="url(#colorAlerts)"
                      strokeWidth={4}
                    />

                  </AreaChart>

                </ResponsiveContainer>

              </div>

            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 shadow-2xl"
            >

              <h2 className="text-2xl font-semibold mb-6">
                HTTP Status Analytics
              </h2>

              <div className="h-[320px]">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <PieChart>

                    <Pie
                      data={statusCodeAnalytics}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={4}
                      dataKey="value"
                      label
                    >

                      {statusCodeAnalytics.map(
                        (
                          entry,
                          index
                        ) => (
                          <Cell
                            key={index}
                            fill={
                              pieColors[
                              index %
                              pieColors.length
                              ]
                            }
                          />
                        )
                      )}

                    </Pie>

                    <Tooltip />

                    <Legend />

                  </PieChart>

                </ResponsiveContainer>

              </div>

            </motion.div>

          </div>

          {/* ATTACKER INTELLIGENCE */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 shadow-2xl mb-8"
          >

            <h2 className="text-2xl font-semibold mb-6">
              Top Attackers
            </h2>

            <div className="overflow-x-auto">

              <table className="w-full border-separate border-spacing-y-3">

                <thead>

                  <tr className="text-slate-400 text-sm">

                    <th className="text-left px-4">
                      Source IP
                    </th>

                    <th className="text-left px-4">
                      Risk Score
                    </th>

                    <th className="text-left px-4">
                      Attack Count
                    </th>

                    <th className="text-left px-4">
                      Last Seen
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {attackers.map((attacker, index) => (

                    <tr
                      key={index}
                      className="bg-slate-950/70"
                    >

                      <td className="px-4 py-5 rounded-l-2xl text-cyan-300 font-medium">
                        {attacker.ip}
                      </td>

                      <td className="px-4 py-5">

                        <span className="bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-1 rounded-full text-sm font-bold">

                          {attacker.risk_score}

                        </span>

                      </td>

                      <td className="px-4 py-5 text-slate-300">
                        {attacker.attack_count}
                      </td>

                      <td className="px-4 py-5 rounded-r-2xl text-slate-400">

                        {new Date(
                          attacker.last_seen
                        ).toLocaleString()}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 shadow-2xl"
          >

            <h2 className="text-2xl font-semibold mb-6">
              Live Threat Alerts
            </h2>

            {loading ? (

              <div className="text-center py-10 text-slate-400">
                Loading alerts...
              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full border-separate border-spacing-y-3">

                  <thead>

                    <tr className="text-slate-400 text-sm">

                      <th className="text-left px-4">
                        Alert Type
                      </th>

                      <th className="text-left px-4">
                        Severity
                      </th>

                      <th className="text-left px-4">
                        Source IP
                      </th>

                      <th className="text-left px-4">
                        Tenant
                      </th>

                      <th className="text-left px-4">
                        Created
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    <AnimatePresence>

                      {alerts.map(
                        (alert) => (

                          <motion.tr
                            key={`${alert.id}-${alert.created_at}`}
                            initial={{
                              opacity: 0,
                              x: 100,
                            }}
                            animate={{
                              opacity: 1,
                              x: 0,
                            }}
                            exit={{
                              opacity: 0,
                            }}
                            whileHover={{
                              scale: 1.01,
                            }}
                            className="bg-slate-950/70"
                          >

                            <td className="px-4 py-5 rounded-l-2xl font-medium">
                              {alert.alert_type}
                            </td>

                            <td className="px-4 py-5">

                              <span
                                className={`px-3 py-1 rounded-full text-xs border ${severityColors[alert.severity]}`}
                              >

                                {alert.severity}

                              </span>

                            </td>

                            <td className="px-4 py-5 text-cyan-300">
                              {alert.source_ip}
                            </td>

                            <td className="px-4 py-5 text-slate-300">
                              {alert.tenant_id}
                            </td>

                            <td className="px-4 py-5 rounded-r-2xl text-slate-400">

                              {new Date(
                                alert.created_at
                              ).toLocaleString()}

                            </td>

                          </motion.tr>
                        )
                      )}

                    </AnimatePresence>

                  </tbody>

                </table>

              </div>

            )}

          </motion.div>

        </main>

      </div>

    </div>
  )
}