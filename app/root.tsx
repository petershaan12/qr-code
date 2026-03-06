import {
    isRouteErrorResponse,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
} from "react-router";
import { useEffect } from "react";
import { useUIStore } from "@/store/useStore";
import type { Route } from "./+types/root";
import "./app.css";

export function Layout({ children }: { children: React.ReactNode }) {
    const initDarkMode = useUIStore((state) => state.initDarkMode);

    useEffect(() => {
        initDarkMode();
    }, [initDarkMode]);

    return (
        <html lang="en" data-theme="light">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
                <Meta />
                <Links />
            </head>
            <body>
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export default function App() {
    return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    let message = "Oops!";
    let details = "An unexpected error occurred.";
    let stack: string | undefined;

    if (isRouteErrorResponse(error)) {
        message = error.status === 404 ? "404" : "Error";
        details =
            error.status === 404
                ? "The requested page could not be found."
                : error.statusText || details;
    } else if (import.meta.env.DEV && error && error instanceof Error) {
        details = error.message;
        stack = error.stack;
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="bg-base-100 rounded-2xl p-8 shadow-xl text-center max-w-md">
                <h1 className="text-4xl font-bold text-red-600 mb-2">{message}</h1>
                <p className="text-base-content/60">{details}</p>
                {stack && (
                    <pre className="mt-4 text-left text-xs bg-base-200 p-4 rounded-lg overflow-auto max-h-60 text-base-content">
                        <code>{stack}</code>
                    </pre>
                )}
            </div>
        </main>
    );
}
