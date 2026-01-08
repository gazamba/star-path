"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
    User,
    Lock,
    LogIn,
    Home,
    Settings,
    Bell,
    Search,
    Plus,
    Edit,
    Trash2,
    Check,
    X
} from "lucide-react";

export default function DemoPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [tasks, setTasks] = useState([
        { id: 1, title: "Complete project documentation", completed: false },
        { id: 2, title: "Review pull requests", completed: true },
        { id: 3, title: "Update dependencies", completed: false },
    ]);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [showSettings, setShowSettings] = useState(false);
    const [loginError, setLoginError] = useState("");
    const [loginSuccess, setLoginSuccess] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError("");
        setLoginSuccess(false);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (email === "demo@starpath.com" && password === "demo123") {
            setLoginSuccess(true);
            setTimeout(() => {
                setIsLoggedIn(true);
                setLoginSuccess(false);
            }, 1000);
        } else {
            setLoginError("Invalid email or password. Try: demo@starpath.com / demo123");
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setEmail("");
        setPassword("");
        setShowNotifications(false);
        setShowSettings(false);
    };

    const addTask = () => {
        if (newTaskTitle.trim()) {
            setTasks([...tasks, {
                id: Date.now(),
                title: newTaskTitle,
                completed: false
            }]);
            setNewTaskTitle("");
        }
    };

    const toggleTask = (id: number) => {
        setTasks(tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        ));
    };

    const deleteTask = (id: number) => {
        setTasks(tasks.filter(task => task.id !== id));
    };

    if (!isLoggedIn) {
        return (
            <main className="mx-auto max-w-4xl px-6 py-12 md:py-20">
                {/* Back to Home */}
                <div className="mb-8">
                    <Button
                        asChild
                        variant="outline"
                        className="border-white/10 bg-white/5 text-purple-200 hover:bg-white/10"
                    >
                        <a href="/">← Back to Home</a>
                    </Button>
                </div>

                <div className="text-center mb-12">
                    <Badge className="mb-4 bg-purple-500/20 text-purple-200 border-purple-500/30">
                        Demo Page for Loom Recording
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 via-pink-200 to-blue-200 mb-4">
                        StarPath Demo
                    </h1>
                    <p className="text-purple-300/80 max-w-2xl mx-auto">
                        Use this page to record a Loom video demonstrating a user flow. Try logging in, managing tasks, and exploring the interface!
                    </p>
                </div>

                <Card className="max-w-md mx-auto p-8 bg-white/5 backdrop-blur-md border-white/10">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                        <p className="text-purple-300/70 text-sm">Sign in to your account</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-purple-100">
                                Email Address
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                                <input
                                    type="email"
                                    placeholder="demo@starpath.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-purple-300/40 outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-purple-100">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-purple-300/40 outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                                />
                            </div>
                        </div>

                        {loginError && (
                            <Alert className="bg-red-500/10 border-red-500/20">
                                <AlertDescription className="text-red-200 text-sm">
                                    {loginError}
                                </AlertDescription>
                            </Alert>
                        )}

                        {loginSuccess && (
                            <Alert className="bg-green-500/10 border-green-500/20">
                                <AlertDescription className="text-green-200 text-sm flex items-center gap-2">
                                    <Check className="w-4 h-4" />
                                    Login successful! Redirecting...
                                </AlertDescription>
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-6"
                        >
                            <LogIn className="mr-2 h-5 w-5" />
                            Sign In
                        </Button>
                    </form>

                    <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <p className="text-xs text-blue-200">
                            <strong>Demo Credentials:</strong><br />
                            Email: demo@starpath.com<br />
                            Password: demo123
                        </p>
                    </div>
                </Card>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-6xl px-6 py-12">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
                        <p className="text-purple-300/70">Welcome back, Demo User!</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="border-white/10 bg-white/5 text-purple-200 hover:bg-white/10 relative"
                        >
                            <Bell className="w-4 h-4" />
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full text-xs flex items-center justify-center">
                                3
                            </span>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowSettings(!showSettings)}
                            className="border-white/10 bg-white/5 text-purple-200 hover:bg-white/10"
                        >
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                        </Button>
                        <Button
                            onClick={handleLogout}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                            Logout
                        </Button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                    <input
                        type="text"
                        placeholder="Search tasks, projects, or files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-purple-300/40 outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    />
                </div>
            </div>

            {/* Notifications Panel */}
            {showNotifications && (
                <Card className="mb-6 p-6 bg-white/5 backdrop-blur-md border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Notifications
                    </h3>
                    <div className="space-y-3">
                        {[
                            { title: "New task assigned", time: "5 minutes ago", type: "info" },
                            { title: "Project deadline approaching", time: "1 hour ago", type: "warning" },
                            { title: "Code review completed", time: "2 hours ago", type: "success" },
                        ].map((notif, i) => (
                            <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-white">{notif.title}</p>
                                    <p className="text-xs text-purple-300/60 mt-1">{notif.time}</p>
                                </div>
                                <Badge className={
                                    notif.type === 'info' ? 'bg-blue-500/20 text-blue-200 border-blue-500/30' :
                                        notif.type === 'warning' ? 'bg-orange-500/20 text-orange-200 border-orange-500/30' :
                                            'bg-green-500/20 text-green-200 border-green-500/30'
                                }>
                                    {notif.type}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Settings Panel */}
            {showSettings && (
                <Card className="mb-6 p-6 bg-white/5 backdrop-blur-md border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Settings
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                            <span className="text-sm text-purple-100">Email Notifications</span>
                            <Button size="sm" variant="outline" className="border-white/10 bg-white/5 text-purple-200">
                                Enabled
                            </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                            <span className="text-sm text-purple-100">Dark Mode</span>
                            <Button size="sm" variant="outline" className="border-white/10 bg-white/5 text-purple-200">
                                On
                            </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                            <span className="text-sm text-purple-100">Language</span>
                            <Button size="sm" variant="outline" className="border-white/10 bg-white/5 text-purple-200">
                                English
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Task Management */}
            <Card className="p-6 bg-white/5 backdrop-blur-md border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Task Management</h3>

                {/* Add Task */}
                <div className="flex gap-3 mb-6">
                    <input
                        type="text"
                        placeholder="Add a new task..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTask()}
                        className="flex-1 px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-purple-300/40 outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    />
                    <Button
                        onClick={addTask}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Task
                    </Button>
                </div>

                {/* Task List */}
                <div className="space-y-3">
                    {tasks.map((task) => (
                        <div
                            key={task.id}
                            className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                        >
                            <button
                                onClick={() => toggleTask(task.id)}
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${task.completed
                                    ? 'bg-green-500 border-green-500'
                                    : 'border-purple-400 hover:border-purple-300'
                                    }`}
                            >
                                {task.completed && <Check className="w-3 h-3 text-white" />}
                            </button>
                            <span className={`flex-1 text-sm ${task.completed ? 'text-purple-300/50 line-through' : 'text-white'}`}>
                                {task.title}
                            </span>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteTask(task.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </div>

                {tasks.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-purple-300/60">No tasks yet. Add one to get started!</p>
                    </div>
                )}
            </Card>
        </main>
    );
}
