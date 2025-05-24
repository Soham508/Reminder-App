import React, { useEffect, useState } from 'react';
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import axios from "axios";

interface Reminder {
    id: number;
    title: string;
    date: string;
    time: string;
    message: string;
    reminder_method: "SMS" | "Email";
    email?: string | null;
    phone_number?: string | null;
}

const Home: React.FC = () => {
    const { isAuthenticated, user, logout, access, fetchUser } = useAuth();
    const navigate = useNavigate();
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        title: "",
        date: "",
        time: "",
        message: "",
        reminder_method: "Email",
        email: "",
        phone_number: "",
    });
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);


    const refreshAccessToken = async () => {
        const refresh = localStorage.getItem("refresh");
        if (!refresh) return null;
        try {
            const res = await axios.post("http://localhost:8000/api/token/refresh/", {
                refresh,
            });
            localStorage.setItem("access", res.data.access);
            return res.data.access;
        } catch {
            return null;
        }
    };


    useEffect(() => {
        const ensureAuthAndUser = async () => {
            if (isAuthenticated && user) {
                setLoading(false);
                return;
            }
            let accessToken = access || localStorage.getItem("access");
            if (!accessToken) {
                navigate("/login");
                return;
            }
            try {
                await axios.get("http://localhost:8000/api/profile/", {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                await fetchUser(accessToken);
            } catch {
                // Try refresh token
                const newAccess = await refreshAccessToken();
                if (newAccess) {
                    try {
                        await axios.get("http://localhost:8000/api/profile/", {
                            headers: { Authorization: `Bearer ${newAccess}` },
                        });
                        await fetchUser(newAccess);
                    } catch {
                        logout();
                        navigate("/login");
                        return;
                    }
                } else {
                    logout();
                    navigate("/login");
                    return;
                }
            }
            setLoading(false);
        };
        ensureAuthAndUser();
        // eslint-disable-next-line
    }, []);


    useEffect(() => {
        const fetchReminders = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const token = localStorage.getItem("access");
                const res = await axios.get("http://localhost:8000/api/reminders/", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setReminders(res.data);
            } catch {
                setReminders([]);
            }
            setLoading(false);
        };
        if (user) fetchReminders();
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setFormError(null);
    };


    const handleEdit = (reminder: Reminder) => {
        setEditId(reminder.id);
        setForm({
            title: reminder.title,
            date: reminder.date,
            time: reminder.time,
            message: reminder.message,
            reminder_method: reminder.reminder_method,
            email: reminder.email || "",
            phone_number: reminder.phone_number || "",
        });
        setShowModal(true);
    };


    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this reminder?")) return;
        try {
            const token = localStorage.getItem("access");
            await axios.delete(`http://localhost:8000/api/reminders/${id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReminders(reminders.filter(r => r.id !== id));
        } catch {
            alert("Failed to delete reminder.");
        }
    };


    const handleCreateOrUpdateReminder = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setSubmitting(true);
        try {
            const payload: any = {
                title: form.title,
                date: form.date,
                time: form.time,
                message: form.message,
                reminder_method: form.reminder_method,
            };
            if (form.reminder_method === "Email") payload.email = form.email;
            if (form.reminder_method === "SMS") payload.phone_number = form.phone_number;
            const token = localStorage.getItem("access");
            if (editId) {
                // Edit
                await axios.put(`http://localhost:8000/api/reminders/${editId}/`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                // Create
                await axios.post("http://localhost:8000/api/reminders/", payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setShowModal(false);
            setEditId(null);
            setForm({
                title: "",
                date: "",
                time: "",
                message: "",
                reminder_method: "Email",
                email: "",
                phone_number: "",
            });
            // Refresh reminders
            const res = await axios.get("http://localhost:8000/api/reminders/", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReminders(res.data);
        } catch (err: any) {
            setFormError(
                err?.response?.data?.email ||
                err?.response?.data?.phone_number ||
                err?.response?.data?.message ||
                "Failed to save reminder"
            );
        }
        setSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
            <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-slate-950/80 sticky top-0 z-10">
                <div className="font-semibold text-lg">{user?.username}</div>
                <Button variant="destructive" onClick={handleLogout} className='cursor-pointer'>
                    Log out
                </Button>
            </header>

            <main className="flex-1 flex flex-col items-center px-16 py-8 w-full">
                <div className="w-full flex flex-col gap-6 items-center jutify-center ">
                    <div className="flex flex-row w-full justify-between mb-2">
                        <h2 className="text-2xl font-bold">Reminders</h2>
                        <Button
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => {
                                setEditId(null);
                                setForm({
                                    title: "",
                                    date: "",
                                    time: "",
                                    message: "",
                                    reminder_method: "Email",
                                    email: "",
                                    phone_number: "",
                                });
                                setShowModal(true);
                            }}
                        >
                            + Create Reminder
                        </Button>
                    </div>
                    {loading ? (
                        <div className="text-center text-zinc-400">Loading...</div>
                    ) : reminders.length === 0 ? (
                        <div className="text-center text-zinc-400">No reminders yet.</div>
                    ) : (
                        <div className="gap-4 w-full overflow-y-auto grid grid-cols-3">
                            {reminders.map((reminder) => (
                                <Card
                                    key={reminder.id}
                                    className="bg-slate-900 border-zinc-700/80 px-4 py-3 flex flex-col gap-2"
                                >
                                    <div>
                                        <div className='flex flex-row items-center gap-2 mb-1'>
                                            <label className='font-medium text-slate-50'> Title :</label>
                                            <div className="font-medium text-slate-50">{reminder.title}</div>
                                        </div>
                                        <div className='flex flex-row items-center gap-2 mb-1'>
                                            <label className='text-sm text-zinc-400'> Message :</label>
                                            <div className="text-sm text-zinc-400">
                                                {reminder.message}
                                            </div>
                                        </div>
                                        <div className="text-xs text-zinc-500 mt-1">
                                            {reminder.date} {reminder.time} &middot;{" "}
                                            {reminder.reminder_method}
                                            {reminder.reminder_method === "Email" &&
                                                reminder.email && <> &middot; {reminder.email}</>}
                                            {reminder.reminder_method === "SMS" &&
                                                reminder.phone_number && (
                                                    <> &middot; {reminder.phone_number}</>
                                                )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        <Button
                                            className='cursor-pointer'
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => handleEdit(reminder)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            className='cursor-pointer'
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleDelete(reminder.id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {showModal && (
                <div className="fixed inset-0 z-20 flex overflow-y-scroll items-center justify-center bg-black/60">
                    <form
                        className="bg-slate-950 border border-zinc-700 rounded-xl p-6 w-full max-w-md flex flex-col gap-4 shadow-xl"
                        onSubmit={handleCreateOrUpdateReminder}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <div className="text-lg font-semibold">
                                {editId ? "Edit Reminder" : "Create Reminder"}
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setShowModal(false);
                                    setEditId(null);
                                }}
                            >
                                Close
                            </Button>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                name="title"
                                type="text"
                                required
                                value={form.title}
                                onChange={handleInputChange}
                                className="border-zinc-700"
                                placeholder="Task Reminder"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                name="date"
                                type="date"
                                required
                                value={form.date}
                                onChange={handleInputChange}
                                className="border-zinc-700"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="time">Time</Label>
                            <Input
                                id="time"
                                name="time"
                                type="time"
                                required
                                value={form.time}
                                onChange={handleInputChange}
                                className="border-zinc-700 bg-slate-950"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="message">Message</Label>
                            <textarea
                                id="message"
                                name="message"
                                required
                                value={form.message}
                                onChange={handleInputChange}
                                className="border border-zinc-700 rounded-md bg-transparent px-3 py-2 text-base"
                                rows={2}
                                placeholder="Reminder details..."
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="reminder_method">Reminder Method</Label>
                            <select
                                id="reminder_method"
                                name="reminder_method"
                                value={form.reminder_method}
                                onChange={handleInputChange}
                                className="border border-zinc-700 rounded-md bg-slate-950 px-3 py-2 text-base"
                            >
                                <option value="Email">Email</option>
                                <option value="SMS">SMS</option>
                            </select>
                        </div>
                        {form.reminder_method === "Email" && (
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={handleInputChange}
                                    className="border-zinc-700"
                                    placeholder="recipient@example.com"
                                />
                            </div>
                        )}
                        {form.reminder_method === "SMS" && (
                            <div className="grid gap-2">
                                <Label htmlFor="phone_number">Phone Number</Label>
                                <Input
                                    id="phone_number"
                                    name="phone_number"
                                    type="tel"
                                    required
                                    value={form.phone_number}
                                    onChange={handleInputChange}
                                    className="border-zinc-700"
                                    placeholder="+1234567890"
                                />
                            </div>
                        )}
                        {formError && (
                            <div className="text-red-500 text-sm">{formError}</div>
                        )}
                        <Button type="submit" variant="secondary" disabled={submitting}>
                            {submitting ? (editId ? "Saving..." : "Creating...") : (editId ? "Save" : "Create")}
                        </Button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Home;