import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const { token, user } = await loginUser(email, password);
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
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
