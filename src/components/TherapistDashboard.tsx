'use client';

import React, { useState, useEffect } from 'react'
import { Bell, Calendar, Clipboard, FileText, Home, Loader2, MessageSquare, Mic, Plus, Settings, Users, Book } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Progress } from "./ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { ScrollArea } from "./ui/scroll-area"

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface Client {
  name: string
  nextSession: string
}

interface Workload {
  clientsThisWeek: number
  totalClients: number
  notesToComplete: number
}

interface Insights {
  trends: string
  predictions: string
}

export default function TherapistDashboard() {
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [chatMessage, setChatMessage] = useState<string>('')
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hello! I'm your AI assistant. How can I help you with your cases today?" },
  ])

  const [clients, setClients] = useState<Client[]>([])
  const [notes, setNotes] = useState<string[]>([])
  const [workload, setWorkload] = useState<Workload>({ clientsThisWeek: 0, totalClients: 0, notesToComplete: 0 })
  const [insights, setInsights] = useState<Insights>({ trends: '', predictions: '' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [clientsRes, notesRes, workloadRes, insightsRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/notes'),
        fetch('/api/workload'),
        fetch('/api/insights')
      ])
      
      const clientsData: Client[] = await clientsRes.json()
      const notesData: string[] = await notesRes.json()
      const workloadData: Workload = await workloadRes.json()
      const insightsData: Insights = await insightsRes.json()

      setClients(clientsData)
      setNotes(notesData)
      setWorkload(workloadData)
      setInsights(insightsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const startRecording = () => {
    setIsRecording(true)
    // Placeholder for actual recording logic
    setTimeout(() => setIsRecording(false), 3000)
  }

  const sendChatMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (chatMessage.trim()) {
      setChatHistory([...chatHistory, { role: 'user', content: chatMessage }])
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: chatMessage })
        })
        const data = await response.json()
        setChatHistory(prev => [...prev, { role: 'assistant', content: data.response }])
      } catch (error) {
        console.error('Error sending message:', error)
      }
      setChatMessage('')
    }
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 shadow-md">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-teal-300">TherapyAI</h1>
        </div>
        <nav className="mt-8">
          <a href="#" className="flex items-center px-4 py-2 text-gray-300 bg-gray-700">
            <Home className="mr-3 h-5 w-5" />
            Dashboard
          </a>
          <a href="#" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors duration-200">
            <Users className="mr-3 h-5 w-5" />
            Clients
          </a>
          <a href="#" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors duration-200">
            <FileText className="mr-3 h-5 w-5" />
            Notes
          </a>
          <a href="#" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors duration-200">
            <Calendar className="mr-3 h-5 w-5" />
            Schedule
          </a>
          <a href="#" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors duration-200">
            <MessageSquare className="mr-3 h-5 w-5" />
            AI Assistant
          </a>
          <a href="#" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors duration-200">
            <Settings className="mr-3 h-5 w-5" />
            Settings
          </a>
          <a href="/knowledge-base" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors duration-200">
            <Book className="mr-3 h-5 w-5" />
            Knowledge Base
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <header className="bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h2 className="text-2xl font-bold leading-7 text-teal-300 sm:truncate">Dashboard</h2>
            <div className="flex items-center">
              <Button variant="outline" size="icon" className="mr-2 text-gray-300 hover:text-teal-300 transition-colors duration-200">
                <Bell className="h-4 w-4" />
              </Button>
              <Avatar>
                <AvatarImage src="/placeholder-user.jpg" alt="User avatar" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="flex flex-col gap-6">
                {/* AI Assistant Chat */}
                <Card className="flex-1 bg-gray-800 border-teal-500/50 shadow-lg shadow-teal-500/10">
                  <CardHeader>
                    <CardTitle className="text-teal-300">AI Assistant</CardTitle>
                    <CardDescription className="text-gray-400">Chat with your AI assistant for case discussions and support</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col h-[400px]">
                    <ScrollArea className="flex-1 pr-4">
                      <div className="space-y-4">
                        {chatHistory.map((message, index) => (
                          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-3 rounded-lg ${message.role === 'user' ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-100'}`}>
                              <p className="text-sm">{message.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                  <CardFooter>
                    <form onSubmit={sendChatMessage} className="flex w-full items-center space-x-2">
                      <Input
                        type="text"
                        placeholder="Ask a question..."
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        className="bg-gray-700 text-gray-100 border-gray-600 focus:border-teal-500 transition-colors duration-200"
                      />
                      <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white transition-colors duration-200">Send</Button>
                    </form>
                  </CardFooter>
                </Card>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  {/* Client Overview */}
                  <Card className="lg:col-span-2 bg-gray-800 border-teal-500/50 shadow-lg shadow-teal-500/10">
                    <CardHeader>
                      <CardTitle className="text-teal-300">Client Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {clients.map((client) => (
                          <div key={client.name} className="flex items-center">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-teal-600 text-white">{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-100">{client.name}</p>
                              <p className="text-sm text-gray-400">Next session: {client.nextSession}</p>
                            </div>
                            <Button variant="outline" size="sm" className="ml-auto text-teal-300 border-teal-500/50 hover:bg-teal-600 hover:text-white transition-colors duration-200">
                              View Profile
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full text-teal-300 border-teal-500/50 hover:bg-teal-600 hover:text-white transition-colors duration-200">
                        <Plus className="mr-2 h-4 w-4" /> Add New Client
                      </Button>
                    </CardFooter>
                  </Card>

                  {/* Workload Management */}
                  <Card className="bg-gray-800 border-teal-500/50 shadow-lg shadow-teal-500/10">
                    <CardHeader>
                      <CardTitle className="text-teal-300">Workload</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm font-medium">
                            <span className="text-gray-300">Clients this week</span>
                            <span className="text-teal-300">{workload.clientsThisWeek}/{workload.totalClients}</span>
                          </div>
                          <Progress value={(workload.clientsThisWeek / workload.totalClients) * 100} className="mt-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm font-medium">
                            <span className="text-gray-300">Notes to complete</span>
                            <span className="text-teal-300">{workload.notesToComplete}</span>
                          </div>
                          <Progress value={(workload.notesToComplete / 10) * 100} className="mt-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  {/* Recent Notes */}
                  <Card className="lg:col-span-2 bg-gray-800 border-teal-500/50 shadow-lg shadow-teal-500/10">
                    <CardHeader>
                      <CardTitle className="text-teal-300">Recent Notes</CardTitle>
                      <CardDescription className="text-gray-400">Click to edit or create a new note</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {notes.map((note, index) => (
                          <div key={index} className="flex items-center">
                            <Clipboard className="h-5 w-5 text-teal-400" />
                            <span className="ml-2 text-sm text-gray-300">{note}</span>
                            <Button variant="ghost" size="sm" className="ml-auto text-teal-300 hover:text-teal-100 hover:bg-gray-700 transition-colors duration-200">
                              Edit
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="flex w-full items-center space-x-2">
                        <Input type="text" placeholder="Dictate new note..." className="bg-gray-700 text-gray-100 border-gray-600 focus:border-teal-500 transition-colors duration-200" />
                        <Button size="icon" onClick={startRecording} className="bg-teal-600 hover:bg-teal-700 text-white transition-colors duration-200">
                          {isRecording ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>

                  {/* AI Insights */}
                  <Card className="bg-gray-800 border-teal-500/50 shadow-lg shadow-teal-500/10">
                    <CardHeader>
                      <CardTitle className="text-teal-300">AI Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="trends">
                        <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                          <TabsTrigger value="trends" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white transition-colors duration-200">
                            Trends
                          </TabsTrigger>
                          <TabsTrigger value="predictions" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white transition-colors duration-200">
                            Predictions
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="trends">
                          <p className="text-sm text-gray-300">{insights.trends}</p>
                        </TabsContent>
                        <TabsContent value="predictions">
                          <p className="text-sm text-gray-300">{insights.predictions}</p>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}