import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Navigate } from "react-router-dom";
import { auth } from "../firebase";
import { Loader } from "../Loader";

interface ProtectedRouteProps {
    children: React.ReactElement;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const [user, loading] = useAuthState(auth);

    if (loading) {
        return <Loader />;
    }

    return user ? children : <Navigate to="/login" />;
};
