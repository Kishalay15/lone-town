import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";
import socket from "../socket";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const { accessToken, refreshToken, user } = await loginUser(email, password); // ✅ fixed destructuring

            localStorage.setItem("token", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
            localStorage.setItem("user", JSON.stringify(user));

            socket.auth = { userId: user._id };
            socket.connect();

            socket.on("connect", () => {
                console.log("Socket connected:");
            });

            socket.on("disconnect", (reason) => {
                console.warn("Socket disconnected:", reason);
            });

            login();
            navigate("/dashboard");
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setError(msg);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-purple-50">
            <form
                onSubmit={handleLogin}
                className="bg-white shadow-xl p-8 rounded-2xl w-full max-w-md"
            >
                <h2 className="text-2xl font-bold text-purple-700 mb-6">Log in to Lone Town</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mb-4 px-4 py-2 border rounded-lg"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mb-6 px-4 py-2 border rounded-lg"
                    required
                />
                <button
                    type="submit"
                    className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                >
                    Log In
                </button>
                <p className="mt-4 text-sm text-center">
                    Don’t have an account?{" "}
                    <a href="/register" className="text-purple-600 hover:underline">
                        Sign up
                    </a>
                </p>
            </form>
        </div>
    );
}
