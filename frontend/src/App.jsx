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
  Terminal,
  Cpu,
  Database,
  Key,
  Sliders,
  User,
  Copy,
  Check,
  Search,
  Filter,
  Trash2,
  Lock,
  Plus,
  Info,
  MapPin,
  RefreshCw
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
  BarChart,
  Bar
} from 'recharts'

const severityColors = {
  CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/40 glowing-alert',
  HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
  MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  LOW: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
}

const pieColors = [
  '#06b6d4', // cyber cyan
  '#ec4899', // cyber pink
  '#3b82f6', // cyber blue
  '#10b981', // cyber emerald
  '#eab308', // cyber yellow
]

function SidebarItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all duration-300 border text-left ${
        active
          ? 'bg-gradient-to-r from-cyan-500/20 to-pink-500/10 border-cyan-500/30 text-white shadow-lg shadow-cyan-500/10 font-semibold'
          : 'border-transparent hover:bg-slate-800/50 text-slate-400 hover:text-white'
      }`}
    >
      <Icon size={20} className={active ? 'text-cyan-400' : 'text-slate-400'} />
      <span>{label}</span>
    </button>
  )
}

function StatCard({ icon: Icon, title, value, glow, trend }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`glass-panel rounded-3xl p-6 relative overflow-hidden ${glow}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-slate-400 text-sm font-medium tracking-wide uppercase">
            {title}
          </p>
          <h3 className="text-4xl font-bold mt-2 tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            {value}
          </h3>
        </div>
        <div className="rounded-2xl bg-white/5 p-3.5 border border-white/10 shadow-inner">
          <Icon className="text-cyan-400" size={24} />
        </div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-slate-500">SYSTEM STATUS: ACTIVE</span>
        {trend && (
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
    </motion.div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = React.useState('Overview')
  
  // Real Data states
  const [alerts, setAlerts] = React.useState([])
  const [connected, setConnected] = React.useState(false)
  const [attackers, setAttackers] = React.useState([])
  const [trafficAnalytics, setTrafficAnalytics] = React.useState({
    total_requests: 0,
    error_requests: 0,
    unique_ips: 0,
  })
  const [statusCodeAnalytics, setStatusCodeAnalytics] = React.useState([])
  const [topPaths, setTopPaths] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  
  // Investigation modal state
  const [selectedAlert, setSelectedAlert] = React.useState(null)
  
  // Threat Intelligence state
  const [selectedAttackerIP, setSelectedAttackerIP] = React.useState(null)

  // Settings State
  const [activeTenant, setActiveTenant] = React.useState('tenant1')
  const [apiKey, setApiKey] = React.useState('tenant1-secret-key')
  const [bruteForceThreshold, setBruteForceThreshold] = React.useState(5)
  const [slackWebhook, setSlackWebhook] = React.useState('https://hooks.slack.com/services/...')
  const [retentionDays, setRetentionDays] = React.useState(30)
  
  // Toast Notification state
  const [toast, setToast] = React.useState(null)
  
  // Real UI Event Console Logs
  const [consoleLogs, setConsoleLogs] = React.useState([])

  // Trigger Toast Notification
  const triggerToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 4500)
  }

  // Append a console log entry
  const addConsoleLog = (message, level = 'INFO') => {
    const timestampStr = new Date().toLocaleTimeString()
    setConsoleLogs(prev => [...prev.slice(-35), `[${timestampStr}] [${level}] ${message}`])
  }

  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const wsUrl = import.meta.env.VITE_WS_URL || apiBaseUrl.replace(/^http/, 'ws');

  // Fetch real data
  const fetchData = async () => {
    setLoading(true)
    addConsoleLog('Querying API endpoints for workspace analytics...', 'SYSTEM')
    try {
      // 1. Fetch Alerts
      const alertsRes = await fetch(`${apiBaseUrl}/alerts`, {
        headers: { 'x-api-key': apiKey },
      })
      if (alertsRes.ok) {
        const data = await alertsRes.json()
        const validAlerts = Array.isArray(data) ? data : (data && Array.isArray(data.alerts) ? data.alerts : [])
        setAlerts(validAlerts)
        addConsoleLog(`Loaded ${validAlerts.length} threat alerts from API`, 'INFO')
      } else {
        throw new Error(`Alerts endpoint returned ${alertsRes.status}`)
      }

      // 2. Fetch Traffic Analytics
      const trafficRes = await fetch(`${apiBaseUrl}/analytics/traffic`)
      if (trafficRes.ok) {
        const data = await trafficRes.json()
        setTrafficAnalytics(data || { total_requests: 0, error_requests: 0, unique_ips: 0 })
        addConsoleLog('Fetched network traffic counters successfully', 'INFO')
      }

      // 3. Fetch Status Code Analytics
      const statusRes = await fetch(`${apiBaseUrl}/analytics/status-codes`)
      if (statusRes.ok) {
        const data = await statusRes.json()
        const rawArray = Array.isArray(data) ? data : (data && Array.isArray(data.status_codes) ? data.status_codes : [])
        const formatted = rawArray.map(item => ({
          name: `${item.status_code || 'unknown'}`,
          value: item.count || 0,
        }))
        setStatusCodeAnalytics(formatted)
        addConsoleLog('Compiled status code distributions', 'INFO')
      }

      // 4. Fetch Top Paths
      const pathsRes = await fetch(`${apiBaseUrl}/analytics/top-paths`)
      if (pathsRes.ok) {
        const data = await pathsRes.json()
        const rawArray = Array.isArray(data) ? data : (data && Array.isArray(data.paths) ? data.paths : [])
        setTopPaths(rawArray)
        addConsoleLog('Retrieved top resource access endpoint lists', 'INFO')
      }

      // 5. Fetch Attackers
      const attackersRes = await fetch(`${apiBaseUrl}/analytics/attackers`)
      if (attackersRes.ok) {
        const data = await attackersRes.json()
        const validAttackers = Array.isArray(data) ? data : (data && Array.isArray(data.attackers) ? data.attackers : [])
        setAttackers(validAttackers)
        if (validAttackers.length > 0 && !selectedAttackerIP) {
          setSelectedAttackerIP(validAttackers[0].ip)
        }
        addConsoleLog(`Identified ${validAttackers.length} top threat actors`, 'INFO')
      }

    } catch (err) {
      addConsoleLog(`Failed API synchronization: ${err.message}`, 'ERROR')
      triggerToast('SIEM Ingestion Server API is offline or unreachable', 'warning')
    } finally {
      setLoading(false)
    }
  }

  // Hook up websockets and API calls
  React.useEffect(() => {
    addConsoleLog('Initializing SentinelX console telemetry interface...', 'SYSTEM')
    fetchData()

    // Establish WebSocket Connection
    let socket = null;
    const wsEndpoint = `${wsUrl}/ws`;
    addConsoleLog(`Connecting to real-time events websocket stream at ${wsEndpoint}...`, 'SYSTEM')
    
    try {
      socket = new WebSocket(wsEndpoint);
      
      socket.onopen = () => {
        setConnected(true)
        addConsoleLog('Real-time websocket telemetry stream established', 'SUCCESS')
        triggerToast('WebSocket link operational', 'success')
      }

      socket.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data)
          addConsoleLog('Received real-time event packet from websocket stream', 'INFO')
          
          const tenantMap = {
            'tenant1-secret-key': 'tenant_1',
            'tenant2-secret-key': 'tenant_2'
          }
          const currentTenantID = tenantMap[apiKey] || apiKey

          setAlerts((prev) => {
            const currentAlerts = Array.isArray(prev) ? prev : [];
            const incomingAlerts = Array.isArray(parsedData) ? parsedData : (parsedData && Array.isArray(parsedData.alerts) ? parsedData.alerts : [parsedData]);
            
            // Filter by active tenant
            const tenantFilteredAlerts = incomingAlerts.filter(
              incoming => incoming && incoming.tenant_id === currentTenantID
            );

            const newAlerts = tenantFilteredAlerts.filter(
              incoming => !currentAlerts.some(a => a && a.id === incoming.id && a.created_at === incoming.created_at)
            );
            if (newAlerts.length === 0) return currentAlerts;
            
            newAlerts.forEach(alert => {
              if (alert) {
                addConsoleLog(`[ALERT ALERT] Identified ${alert.severity || 'UNKNOWN'} ${alert.alert_type || 'INCIDENT'} from IP ${alert.source_ip || 'unknown'}`, 'WARN')
              }
            })
            
            return [...newAlerts, ...currentAlerts];
          })
          
          // Re-fetch analytics to sync
          fetchTrafficAnalytics()
          fetchStatusCodeAnalytics()
          fetchAttackers()
        } catch (e) {
          addConsoleLog('Parsing incoming websocket payload failed', 'ERROR')
        }
      }

      socket.onerror = (e) => {
        setConnected(false)
        addConsoleLog('Websocket channel encountered an network error', 'ERROR')
      }

      socket.onclose = () => {
        setConnected(false)
        addConsoleLog('Websocket telemetry feed disconnected', 'WARN')
      }
    } catch (e) {
      setConnected(false)
      addConsoleLog('Could not establish client websocket handle', 'ERROR')
    }

    return () => {
      if (socket) socket.close()
    }
  }, [apiKey])

  // Helper fetch functions (used by WS updates)
  async function fetchTrafficAnalytics() {
    try {
      const response = await fetch(`${apiBaseUrl}/analytics/traffic`);
      if (response.ok) {
        const data = await response.json()
        setTrafficAnalytics(data || { total_requests: 0, error_requests: 0, unique_ips: 0 })
      }
    } catch (e) {}
  }
  async function fetchStatusCodeAnalytics() {
    try {
      const response = await fetch(`${apiBaseUrl}/analytics/status-codes`);
      if (response.ok) {
        const data = await response.json()
        const formatted = (data || []).map(item => ({ name: `${item.status_code}`, value: item.count }))
        setStatusCodeAnalytics(formatted)
      }
    } catch (e) {}
  }
  async function fetchAttackers() {
    try {
      const response = await fetch(`${apiBaseUrl}/analytics/attackers`);
      if (response.ok) {
        const data = await response.json()
        setAttackers(data || [])
      }
    } catch (e) {}
  }

  // Threat activity hours aggregator
  const analyticsMap = {}
  ;(alerts || []).forEach((alert) => {
    if (!alert || !alert.created_at) return
    const date = new Date(alert.created_at)
    const hour = `${String(date.getHours()).padStart(2, '0')}:00`
    if (!analyticsMap[hour]) {
      analyticsMap[hour] = 0
    }
    analyticsMap[hour] += 1
  })

  const analyticsData = Object.keys(analyticsMap)
    .sort()
    .map((hour) => ({
      time: hour,
      alerts: analyticsMap[hour],
    }))

  // Success rate formula
  const successRate = trafficAnalytics.total_requests
    ? Math.round(
        ((trafficAnalytics.total_requests - trafficAnalytics.error_requests) /
          trafficAnalytics.total_requests) *
          100
      )
    : 100

  // Alert filters state variables
  const [filterSeverity, setFilterSeverity] = React.useState('ALL')
  const [filterType, setFilterType] = React.useState('ALL')
  const [searchIP, setSearchIP] = React.useState('')

  // Filter alerts
  const filteredAlerts = (alerts || []).filter(alert => {
    if (!alert) return false
    const matchSeverity = filterSeverity === 'ALL' || alert.severity === filterSeverity
    const matchType = filterType === 'ALL' || alert.alert_type === filterType
    const matchIP = searchIP === '' || (alert.source_ip || '').includes(searchIP) || (alert.message || '').toLowerCase().includes(searchIP.toLowerCase())
    return matchSeverity && matchType && matchIP
  })

  // Remediation actions simulator
  const handleRemediate = (alert, actionType) => {
    if (!alert) return
    triggerToast(`[REMEDIATION] Initiating action: ${actionType} for IP ${alert.source_ip}`, 'success')
    addConsoleLog(`[REMEDIATION] Successfully applied ${actionType} filter for IP ${alert.source_ip}`, 'SYSTEM-ACTION')
    setSelectedAlert(null)
  }

  // Attacker dossiers
  const activeAttackerDetails = (attackers || []).find(a => a.ip === selectedAttackerIP)

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans antialiased overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Glow backgrounds */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(circle_at_50%_0%,_rgba(6,182,212,0.12),_rgba(236,72,153,0.05),transparent_60%)] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_80%_80%,_rgba(59,130,246,0.08),transparent_60%)] pointer-events-none z-0" />

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl border backdrop-blur-md shadow-2xl flex items-center gap-3 ${
              toast.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300'
                : toast.type === 'warning'
                ? 'bg-rose-950/80 border-rose-500/30 text-rose-300'
                : 'bg-slate-900/80 border-slate-700/50 text-cyan-300'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="text-emerald-400 shrink-0 animate-bounce" size={20} />
            ) : toast.type === 'warning' ? (
              <AlertTriangle className="text-rose-400 shrink-0 animate-pulse" size={20} />
            ) : (
              <Info className="text-cyan-400 shrink-0" size={20} />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div className="relative z-10 flex flex-1 w-full">
        
        {/* Left Sidebar */}
        <aside className="w-[280px] border-r border-white/5 bg-slate-950/60 backdrop-blur-3xl p-6 hidden lg:flex flex-col justify-between shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-10 mt-2">
              <div className="rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-pink-500 p-2.5 shadow-lg shadow-cyan-500/20">
                <Shield size={26} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-pink-400 bg-clip-text text-transparent tracking-wider">
                  SENTINELX
                </h1>
                <p className="text-slate-500 text-[11px] font-semibold tracking-widest uppercase">
                  Enterprise SIEM
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <SidebarItem
                icon={BarChart3}
                label="Overview"
                active={activeTab === 'Overview'}
                onClick={() => setActiveTab('Overview')}
              />
              <SidebarItem
                icon={AlertTriangle}
                label="Threat Alerts"
                active={activeTab === 'Threat Alerts'}
                onClick={() => setActiveTab('Threat Alerts')}
              />
              <SidebarItem
                icon={Activity}
                label="Analytics"
                active={activeTab === 'Analytics'}
                onClick={() => setActiveTab('Analytics')}
              />
              <SidebarItem
                icon={Radar}
                label="Threat Intelligence"
                active={activeTab === 'Threat Intelligence'}
                onClick={() => setActiveTab('Threat Intelligence')}
              />
              <SidebarItem
                icon={Server}
                label="Infrastructure"
                active={activeTab === 'Infrastructure'}
                onClick={() => setActiveTab('Infrastructure')}
              />
              <SidebarItem
                icon={Settings}
                label="Settings"
                active={activeTab === 'Settings'}
                onClick={() => setActiveTab('Settings')}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900/50 border border-white/5 p-4 mt-auto">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-cyan-400 animate-ping' : 'bg-red-500'}`} />
              <span className="text-xs font-semibold text-slate-300">TELEMETRY STREAM</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {connected ? 'Monitoring real-time client HTTP & SSH log streams.' : 'Websocket link is currently down.'}
            </p>
          </div>
        </aside>

        {/* Main Dashboard Space */}
        <main className="flex-1 flex flex-col p-6 lg:p-8 overflow-y-auto max-h-screen">
          
          {/* Header Bar */}
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 shrink-0">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">
                <span>Observability Hub</span>
                <span>/</span>
                <span className="text-cyan-400">{activeTab}</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Security Operations Center
              </h2>
            </div>

            <div className="flex items-center flex-wrap gap-3">
              <button
                onClick={fetchData}
                disabled={loading}
                className="px-3.5 py-1.5 bg-slate-800/80 border border-white/5 hover:bg-slate-700/80 text-xs font-semibold text-slate-300 rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                Refresh Data
              </button>

              <div
                className={`px-4 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 tracking-wide ${
                  connected
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-lg shadow-emerald-500/5'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                }`}
              >
                <Wifi size={14} className={connected ? 'animate-pulse' : ''} />
                {connected ? 'LIVE STREAM ACTIVE' : 'LIVE FEED DOWN'}
              </div>
            </div>
          </header>

          {/* Active Tab Page Render */}
          <div className="flex-1 z-10">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'Overview' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                  <StatCard
                    icon={Globe}
                    title="Ingested Logs (HTTP)"
                    value={trafficAnalytics.total_requests.toLocaleString()}
                    glow="shadow-cyan-500/5"
                  />
                  <StatCard
                    icon={AlertTriangle}
                    title="Warning/Error Logs"
                    value={trafficAnalytics.error_requests.toLocaleString()}
                    glow="shadow-pink-500/5"
                  />
                  <StatCard
                    icon={Server}
                    title="Unique Source IPs"
                    value={trafficAnalytics.unique_ips.toLocaleString()}
                    glow="shadow-blue-500/5"
                  />
                  <StatCard
                    icon={CheckCircle2}
                    title="Request Success Rate"
                    value={`${successRate}%`}
                    glow="shadow-emerald-500/5"
                  />
                </div>

                {/* Primary Chart Area */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Area Chart */}
                  <div className="xl:col-span-2 glass-panel rounded-3xl p-6 relative">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold">Threat Activity Timeline</h3>
                        <p className="text-slate-400 text-xs mt-1">Aggregated warning and brute force triggers hourly</p>
                      </div>
                    </div>

                    <div className="h-[300px]">
                      {analyticsData.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                          No active threat alerts recorded. Timeline idle.
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={analyticsData}>
                            <defs>
                              <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                            <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                            <Tooltip
                              contentStyle={{ background: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                              labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                            />
                            <Area
                              type="monotone"
                              dataKey="alerts"
                              stroke="#06b6d4"
                              fillOpacity={1}
                              fill="url(#colorAlerts)"
                              strokeWidth={3}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Status Codes Pie Chart */}
                  <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold">Traffic Profile (HTTP)</h3>
                      <p className="text-slate-400 text-xs mt-1">Access status code distribution</p>
                    </div>

                    <div className="h-[240px] my-2 relative flex items-center justify-center">
                      {statusCodeAnalytics.length === 0 ? (
                        <div className="text-slate-500 text-sm">No HTTP codes recorded.</div>
                      ) : (
                        <>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={statusCodeAnalytics}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={95}
                                paddingAngle={3}
                                dataKey="value"
                              >
                                {statusCodeAnalytics.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{ background: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute text-center">
                            <span className="text-xs text-slate-500 font-bold block uppercase tracking-widest">OK Ratio</span>
                            <span className="text-3xl font-black text-white">{successRate}%</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-y-2 justify-center gap-x-4 text-xs font-semibold text-slate-400">
                      {statusCodeAnalytics.map((item, index) => (
                        <div key={item.name} className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pieColors[index % pieColors.length] }} />
                          <span>Code {item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Secondary Bottom Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Top Attackers List */}
                  <div className="glass-panel rounded-3xl p-6 xl:col-span-1">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-bold">Risk Leaderboard</h3>
                        <p className="text-slate-400 text-xs">Top attacker source IPs</p>
                      </div>
                      <Radar className="text-pink-500" size={18} />
                    </div>

                    <div className="space-y-4">
                      {attackers.length === 0 ? (
                        <div className="py-12 text-center text-slate-500 text-xs">No recorded threat sources.</div>
                      ) : (
                        attackers.slice(0, 4).map((attacker) => (
                          <div
                            key={attacker.ip}
                            onClick={() => {
                              setSelectedAttackerIP(attacker.ip)
                              setActiveTab('Threat Intelligence')
                            }}
                            className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-cyan-500/30 cursor-pointer transition-all duration-250 group"
                          >
                            <div>
                              <span className="text-sm font-semibold text-cyan-400 group-hover:text-cyan-300 transition-colors block">
                                {attacker.ip}
                              </span>
                              <span className="text-[11px] text-slate-500 block mt-0.5 font-mono">
                                SEEN: {new Date(attacker.last_seen).toLocaleTimeString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">{attacker.attack_count} events</span>
                              <span className="bg-rose-500/10 text-rose-400 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-rose-500/20">
                                {attacker.risk_score} RISK
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Recent Live Alert Ticker */}
                  <div className="glass-panel rounded-3xl p-6 xl:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-bold">Critical Alert Feed</h3>
                        <p className="text-slate-400 text-xs">Real-time threat alerts streams</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('Threat Alerts')}
                        className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline font-semibold"
                      >
                        View All Alerts →
                      </button>
                    </div>

                    <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                      {alerts.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 text-sm">
                          No active threat alerts in logs buffer.
                        </div>
                      ) : (
                        alerts.slice(0, 4).map((alert) => (
                          <div
                            key={`${alert.id}-${alert.created_at}`}
                            onClick={() => setSelectedAlert(alert)}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-white/5 hover:border-white/10 cursor-pointer transition-all duration-200"
                          >
                            <div className="flex items-center gap-3">
                              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border uppercase shrink-0 ${severityColors[alert.severity]}`}>
                                {alert.severity}
                              </span>
                              <div>
                                <h4 className="text-sm font-semibold text-white tracking-wide">
                                  {alert.alert_type === 'brute_force' ? 'SSH Brute Force Attempt' : 'Suspicious Web Directory Scan'}
                                </h4>
                                <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                                  {alert.message}
                                </p>
                              </div>
                            </div>
                            <div className="text-right mt-2 sm:mt-0 shrink-0 text-xs text-slate-500">
                              {new Date(alert.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* THREAT ALERTS TAB */}
            {activeTab === 'Threat Alerts' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Filters Row */}
                <div className="glass-panel rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-xl border border-white/5 text-xs text-slate-400">
                      <Filter size={14} />
                      <span className="font-semibold">Filter Severity:</span>
                    </div>
                    {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
                      <button
                        key={sev}
                        onClick={() => setFilterSeverity(sev)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          filterSeverity === sev
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-transparent text-slate-400 border-transparent hover:bg-slate-800/40'
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative flex-1 md:w-[240px]">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input
                        type="text"
                        value={searchIP}
                        onChange={(e) => setSearchIP(e.target.value)}
                        placeholder="Search IP or alert info..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-white/5 text-sm focus:outline-none focus:border-cyan-500/30 text-white"
                      />
                    </div>
                    <button
                      onClick={() => {
                        setFilterSeverity('ALL')
                        setFilterType('ALL')
                        setSearchIP('')
                      }}
                      className="p-2 rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Alerts List Table */}
                <div className="glass-panel rounded-3xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-900/30">
                          <th className="px-6 py-4.5 text-left">Alert Type</th>
                          <th className="px-6 py-4.5 text-left">Severity</th>
                          <th className="px-6 py-4.5 text-left">Source IP</th>
                          <th className="px-6 py-4.5 text-left">Tenant</th>
                          <th className="px-6 py-4.5 text-left">Occurred At</th>
                          <th className="px-6 py-4.5 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredAlerts.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm">
                              No security threat events match the specified search filters.
                            </td>
                          </tr>
                        ) : (
                          filteredAlerts.map((alert) => (
                            <tr
                              key={`${alert.id}-${alert.created_at}`}
                              className="hover:bg-slate-900/30 transition-colors"
                            >
                              <td className="px-6 py-4 font-semibold text-slate-200">
                                <div className="flex items-center gap-2">
                                  {alert.alert_type === 'brute_force' ? (
                                    <Lock size={15} className="text-red-400" />
                                  ) : (
                                    <Globe size={15} className="text-orange-400" />
                                  )}
                                  <span className="uppercase">{alert.alert_type.replace('_', ' ')}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border uppercase ${severityColors[alert.severity] || 'bg-slate-700'}`}>
                                  {alert.severity}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-cyan-400 font-mono font-medium">{alert.source_ip}</td>
                              <td className="px-6 py-4 text-slate-400 font-medium">{alert.tenant_id}</td>
                              <td className="px-6 py-4 text-slate-500 text-xs font-mono">
                                {new Date(alert.created_at).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button
                                  onClick={() => setSelectedAlert(alert)}
                                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-500/40 text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-all"
                                >
                                  Investigate
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ANALYTICS TAB */}
            {activeTab === 'Analytics' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Top Metrics Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="glass-panel rounded-3xl p-6 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 block font-bold tracking-wider uppercase">Pipeline Logs</span>
                      <span className="text-2xl font-extrabold mt-1 block">{trafficAnalytics.total_requests.toLocaleString()}</span>
                    </div>
                    <Cpu size={24} className="text-cyan-400" />
                  </div>
                  <div className="glass-panel rounded-3xl p-6 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 block font-bold tracking-wider uppercase">Active Warnings</span>
                      <span className="text-2xl font-extrabold mt-1 block">{trafficAnalytics.error_requests.toLocaleString()}</span>
                    </div>
                    <Database size={24} className="text-pink-400" />
                  </div>
                  <div className="glass-panel rounded-3xl p-6 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 block font-bold tracking-wider uppercase">Active Link</span>
                      <span className="text-2xl font-extrabold mt-1 block">{connected ? 'Operational' : 'API Node'}</span>
                    </div>
                    <CheckCircle2 size={24} className="text-emerald-400" />
                  </div>
                </div>

                {/* Analytical Charts */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Traffic Volume Chart */}
                  <div className="glass-panel rounded-3xl p-6">
                    <h3 className="text-xl font-bold mb-6">Traffic Volume Stream</h3>
                    <div className="h-[280px]">
                      {analyticsData.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-500 text-sm">No activity records found.</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={analyticsData}>
                            <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                            <YAxis stroke="#64748b" fontSize={11} />
                            <Tooltip
                              contentStyle={{ background: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            />
                            <Area type="monotone" dataKey="alerts" stroke="#ec4899" fill="rgba(236,72,153,0.1)" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Top Request Paths Bar Chart */}
                  <div className="glass-panel rounded-3xl p-6">
                    <h3 className="text-xl font-bold mb-6">Resource Access Paths</h3>
                    <div className="h-[280px]">
                      {topPaths.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-500 text-sm">No accessed paths logged.</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={topPaths.slice(0, 6)}>
                            <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                            <XAxis dataKey="path" stroke="#64748b" fontSize={10} tickLine={false} />
                            <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                            <Tooltip
                              contentStyle={{ background: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            />
                            <Bar dataKey="count" fill="#06b6d4" radius={[6, 6, 0, 0]}>
                              {topPaths.slice(0, 6).map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.path.includes('.env') || entry.path.includes('admin') ? '#ec4899' : '#06b6d4'}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>

                {/* Path Table */}
                <div className="glass-panel rounded-3xl p-6">
                  <h3 className="text-lg font-bold mb-4">Ingested Resource Table</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/5 text-slate-400 text-xs font-bold uppercase tracking-wider text-left">
                          <th className="pb-3">Endpoint Path</th>
                          <th className="pb-3 text-right">Access Hit Count</th>
                          <th className="pb-3 text-right">Security Risk Class</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {topPaths.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="py-6 text-center text-slate-500 text-xs">No path assets found in telemetry.</td>
                          </tr>
                        ) : (
                          topPaths.map((item, idx) => {
                            const isHighRisk = item.path.includes('.env') || item.path.includes('admin') || item.path.includes('passwd');
                            return (
                              <tr key={idx} className="hover:bg-slate-900/10">
                                <td className="py-3 font-mono text-xs text-slate-300">{item.path}</td>
                                <td className="py-3 text-right text-slate-400">{item.count.toLocaleString()}</td>
                                <td className="py-3 text-right">
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                    isHighRisk 
                                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                                      : 'bg-slate-800 text-slate-400 border-white/5'
                                  }`}>
                                    {isHighRisk ? 'SUSPICIOUS ACCESS' : 'STANDARD ASSET'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* THREAT INTELLIGENCE TAB */}
            {activeTab === 'Threat Intelligence' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 xl:grid-cols-3 gap-6"
              >
                {/* Left IP Selector list */}
                <div className="glass-panel rounded-3xl p-6 flex flex-col gap-4">
                  <div>
                    <h3 className="text-lg font-bold">Attacker Sources</h3>
                    <p className="text-slate-400 text-xs">Select host IP to retrieve intelligence dossier</p>
                  </div>

                  <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                    {attackers.length === 0 ? (
                      <div className="py-12 text-center text-slate-500 text-xs">No active host sources identified.</div>
                    ) : (
                      attackers.map(attacker => (
                        <button
                          key={attacker.ip}
                          onClick={() => setSelectedAttackerIP(attacker.ip)}
                          className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                            selectedAttackerIP === attacker.ip
                              ? 'bg-slate-900 border-cyan-500/55'
                              : 'bg-transparent border-white/5 hover:bg-slate-900/30'
                          }`}
                        >
                          <div>
                            <span className="font-mono text-sm font-semibold text-white block">{attacker.ip}</span>
                            <span className="text-[10px] text-slate-500 block mt-1 font-mono">
                              Seen: {new Date(attacker.last_seen).toLocaleTimeString()}
                            </span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${
                            attacker.risk_score >= 85 
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
                              : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                          }`}>
                            {attacker.risk_score} Risk
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Right Dossier Panel */}
                <div className="xl:col-span-2 glass-panel rounded-3xl p-6 space-y-6">
                  {!selectedAttackerIP || !activeAttackerDetails ? (
                    <div className="h-full flex items-center justify-center text-slate-500 text-sm py-24">
                      Select an active attacker IP from the leaderboard to retrieve correlation dossier.
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl bg-rose-500/15 p-3 text-rose-400 border border-rose-500/20">
                            <Radar size={28} className="animate-pulse" />
                          </div>
                          <div>
                            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Host Threat Profile</span>
                            <h3 className="text-2xl font-mono font-bold text-cyan-400 mt-0.5">{selectedAttackerIP}</h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 font-medium">Risk Factor:</span>
                          <span className="bg-rose-500/20 text-rose-400 font-bold px-3 py-1.5 rounded-xl border border-rose-500/30 text-sm">
                            {activeAttackerDetails.risk_score}% CRITICAL
                          </span>
                        </div>
                      </div>

                      {/* Info grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2">
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wider">
                            <MapPin size={14} className="text-cyan-400" />
                            <span>Source Node Range</span>
                          </div>
                          <p className="text-xl font-bold text-white font-mono">
                            {selectedAttackerIP.split('.').slice(0,3).join('.')}.0/24
                          </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2">
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wider">
                            <Globe size={14} className="text-cyan-400" />
                            <span>Total Event Detections</span>
                          </div>
                          <p className="text-xl font-bold text-white">
                            {activeAttackerDetails.attack_count} correlated logs
                          </p>
                        </div>
                      </div>

                      {/* Threat Signatures */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Security Correlation Signatures</h4>
                        <div className="space-y-3">
                          <div className="p-4 rounded-xl bg-slate-950 border border-white/5 flex items-start gap-3">
                            <Lock className="text-red-400 shrink-0 mt-0.5" size={16} />
                            <div>
                              <h5 className="text-xs font-bold text-white uppercase">Automated Logins Scanner</h5>
                              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                Continuous brute-force log activities mapped on host endpoints. Attack count: {activeAttackerDetails.attack_count}.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* WHOIS Simulated Detail */}
                      <div className="p-5 rounded-2xl bg-slate-950/80 border border-white/5">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Threat intelligence WHOIS details</h4>
                        <pre className="text-[11px] font-mono text-cyan-500/80 leading-relaxed overflow-x-auto select-all">
{`% WHOIS lookup for ${selectedAttackerIP}
% Data parsed from local postgres DB logs

IP Address:      ${selectedAttackerIP}
Network Range:   ${selectedAttackerIP.split('.').slice(0,3).join('.')}.0/24
Last Activity:   ${new Date(activeAttackerDetails.last_seen).toISOString()}
Alert count:     ${activeAttackerDetails.attack_count}
Status:          Monitored on active firewall rules`}
                        </pre>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleRemediate({ source_ip: selectedAttackerIP }, 'BLOCK_IP')}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 font-semibold text-xs text-white transition-all shadow-lg"
                        >
                          Add IP to Blocklist
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {/* INFRASTRUCTURE TAB */}
            {activeTab === 'Infrastructure' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Node Status Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
                  {/* Item */}
                  <div className="glass-panel rounded-3xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-slate-400">INGESTION API</span>
                      <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
                    </div>
                    <p className="text-xl font-bold">{connected ? 'Connected' : 'Offline'}</p>
                    <p className="text-[10px] text-slate-500 mt-1">REST API | Websockets</p>
                  </div>
                  {/* Item */}
                  <div className="glass-panel rounded-3xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-slate-400">POSTGRESQL</span>
                      <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
                    </div>
                    <p className="text-xl font-bold">{connected ? 'Healthy' : 'N/A'}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Primary DB storage</p>
                  </div>
                  {/* Item */}
                  <div className="glass-panel rounded-3xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-slate-400">KAFKA CONSUMER</span>
                      <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
                    </div>
                    <p className="text-xl font-bold">{connected ? 'Listening' : 'N/A'}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Topic: siem-logs</p>
                  </div>
                </div>

                {/* Console Log Terminal */}
                <div className="glass-panel rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Terminal size={18} className="text-cyan-400" />
                      <h3 className="text-lg font-bold">Client Action & Event Console</h3>
                    </div>
                    <button
                      onClick={() => setConsoleLogs([])}
                      className="text-[10px] text-slate-500 hover:text-white uppercase font-bold border border-white/5 px-2.5 py-1 rounded-lg"
                    >
                      Clear Console
                    </button>
                  </div>

                  <div className="h-[280px] bg-slate-950/80 rounded-2xl border border-white/5 p-4 font-mono text-[11px] text-slate-300 overflow-y-auto space-y-2 shadow-inner select-text">
                    {consoleLogs.length === 0 ? (
                      <div className="text-slate-500 italic text-center py-12">Console active. Telemetry event logs print here...</div>
                    ) : (
                      consoleLogs.map((log, idx) => {
                        let colorClass = 'text-slate-400';
                        if (log.includes('[SYSTEM]')) colorClass = 'text-cyan-400';
                        if (log.includes('[WARN]')) colorClass = 'text-rose-400 font-semibold animate-pulse';
                        if (log.includes('[SUCCESS]')) colorClass = 'text-emerald-400';
                        if (log.includes('[SYSTEM-ACTION]')) colorClass = 'text-emerald-400 font-semibold';
                        return (
                          <div key={idx} className={colorClass}>
                            {log}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'Settings' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 xl:grid-cols-2 gap-6"
              >
                {/* Configuration Panel */}
                <div className="glass-panel rounded-3xl p-6 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold">SIEM Core Properties</h3>
                    <p className="text-slate-400 text-xs">Configure threat parameters and client keys</p>
                  </div>

                  {/* Tenant Select */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Tenant Segment</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['tenant1', 'tenant2', 'tenant3'].map(tenant => (
                        <button
                          key={tenant}
                          onClick={() => {
                            setActiveTenant(tenant)
                            const key = `${tenant}-secret-key`
                            setApiKey(key)
                            triggerToast(`Switched workspace to ${tenant}`, 'info')
                            addConsoleLog(`Switched tenant segment focus to ${tenant}`, 'SYSTEM')
                          }}
                          className={`py-3.5 rounded-xl border text-xs font-bold transition-all ${
                            activeTenant === tenant
                              ? 'bg-slate-900 border-cyan-500/50 text-white shadow-lg'
                              : 'bg-transparent border-white/5 text-slate-400 hover:bg-slate-900/30'
                          }`}
                        >
                          {tenant.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* API Key */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Log Ingestion API Key</label>
                    <div className="flex gap-2">
                      <div className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-white/5 font-mono text-sm text-cyan-400 flex items-center justify-between select-all">
                        <span>{apiKey}</span>
                        <Lock size={14} className="text-slate-600" />
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(apiKey)
                          triggerToast('Copied key to clipboard', 'success')
                        }}
                        className="p-3 bg-slate-900 border border-white/5 rounded-xl hover:border-white/20 text-slate-400 hover:text-white"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Slider Threshold */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">SSH Failed Login Limit</label>
                      <span className="text-xs font-bold text-cyan-400">{bruteForceThreshold} attempts</span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="15"
                      value={bruteForceThreshold}
                      onChange={(e) => setBruteForceThreshold(Number(e.target.value))}
                      className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                    <span className="text-[10px] text-slate-500 block">
                      SSH auth failure count triggers brute_force alert within 60s window.
                    </span>
                  </div>
                </div>

                {/* Routing & Retention panel */}
                <div className="glass-panel rounded-3xl p-6 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold">Alert Routing & Storage</h3>
                    <p className="text-slate-400 text-xs">Manage webhooks and db logs retention</p>
                  </div>

                  {/* Webhook Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Slack Webhook URL</label>
                    <input
                      type="text"
                      value={slackWebhook}
                      onChange={(e) => setSlackWebhook(e.target.value)}
                      placeholder="https://hooks.slack.com/services/..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/5 text-sm focus:outline-none focus:border-cyan-500/30 text-white font-mono"
                    />
                    <span className="text-[10px] text-slate-500 block">
                      Critical alerts broadcast immediately to Slack channel.
                    </span>
                  </div>

                  {/* Retention Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Database Log Retention</label>
                      <span className="text-xs font-bold text-cyan-400">{retentionDays} Days</span>
                    </div>
                    <input
                      type="range"
                      min="7"
                      max="90"
                      step="7"
                      value={retentionDays}
                      onChange={(e) => setRetentionDays(Number(e.target.value))}
                      className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                    <span className="text-[10px] text-slate-500 block">
                      Postgres rows exceeding partition age automatically deleted via cron.
                    </span>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <button
                      onClick={() => {
                        triggerToast('Core properties updated successfully', 'success')
                        addConsoleLog('Updated active SIEM configuration values', 'SYSTEM')
                      }}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-white transition-all shadow-lg"
                    >
                      Save Configuration
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

          </div>

        </main>

      </div>

      {/* Investigation Details Drawer (Framer Motion Drawer) */}
      <AnimatePresence>
        {selectedAlert && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAlert(null)}
              className="fixed inset-0 z-40 bg-black"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[550px] bg-slate-950 border-l border-white/10 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2">
                    <Shield className="text-cyan-400" size={20} />
                    <h3 className="text-lg font-bold">Threat Investigation Dossier</h3>
                  </div>
                  <button
                    onClick={() => setSelectedAlert(null)}
                    className="p-1 rounded-lg border border-white/5 hover:border-white/10 text-slate-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>

                {/* Main Alert Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border uppercase ${severityColors[selectedAlert.severity] || 'bg-slate-700'}`}>
                      {selectedAlert.severity}
                    </span>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">
                      Event ID: #{selectedAlert.id}
                    </span>
                  </div>

                  <h4 className="text-xl font-bold leading-tight">
                    {selectedAlert.alert_type === 'brute_force' 
                      ? 'Automated SSH Auth Brute Force Attack' 
                      : 'Sensitive Endpoint Directory Scanning'}
                  </h4>

                  <p className="text-sm text-slate-300 leading-relaxed bg-slate-900 border border-white/5 p-4 rounded-xl">
                    {selectedAlert.message}
                  </p>
                </div>

                {/* Details list */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-900/50 border border-white/5 rounded-xl">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Attacker Source IP</span>
                    <span className="text-sm font-mono font-semibold text-cyan-400 block mt-1">{selectedAlert.source_ip}</span>
                  </div>
                  <div className="p-3 bg-slate-900/50 border border-white/5 rounded-xl">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Target Tenant Workspace</span>
                    <span className="text-sm font-semibold text-white block mt-1">{selectedAlert.tenant_id}</span>
                  </div>
                  <div className="p-3 bg-slate-900/50 border border-white/5 rounded-xl">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Ingested Time</span>
                    <span className="text-xs text-slate-400 block mt-1">
                      {new Date(selectedAlert.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900/50 border border-white/5 rounded-xl">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Status Code Correlation</span>
                    <span className="text-xs text-slate-400 block mt-1">
                      {selectedAlert.alert_type === 'brute_force' ? 'Auth failure (SSH)' : 'HTTP 404/401 Unauthorized'}
                    </span>
                  </div>
                </div>

                {/* SOC Security Action playbook */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Info size={14} className="text-cyan-400" />
                    SOC Response Playbook
                  </h5>
                  <div className="p-4 rounded-xl bg-slate-900 border border-white/5 text-xs text-slate-300 leading-relaxed space-y-2 select-text">
                    <p className="font-bold text-cyan-400">Threat Intel Recommendation:</p>
                    <p>
                      This source host IP exhibits behavioral indicators of automated brute force orchestration scripts. It is recommended to perform the following:
                    </p>
                    <ul className="list-disc pl-4 space-y-1.5 mt-2">
                      <li>Nullify the current route for {selectedAlert.source_ip} via router ACL.</li>
                      <li>Scan logs for successful authentication events immediately following this trigger.</li>
                      <li>Confirm if root logins are disabled in /etc/ssh/sshd_config.</li>
                    </ul>
                  </div>
                </div>

                {/* JSON Payload viewer */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Raw Telemetry JSON</span>
                  <pre className="p-4 bg-slate-950 rounded-xl border border-white/5 font-mono text-[10px] text-cyan-500/80 overflow-x-auto select-all max-h-[160px]">
{JSON.stringify(selectedAlert, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Remediation Triggers */}
              <div className="border-t border-white/5 pt-4 mt-6 flex gap-3">
                <button
                  onClick={() => handleRemediate(selectedAlert, 'BLOCK_IP')}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-xs font-bold text-white rounded-xl transition-all shadow-lg"
                >
                  Block IP Gateway
                </button>
                <button
                  onClick={() => handleRemediate(selectedAlert, 'DISMISS')}
                  className="flex-1 py-3 bg-slate-900 border border-white/5 hover:border-white/10 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-all"
                >
                  Dismiss Alert
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}