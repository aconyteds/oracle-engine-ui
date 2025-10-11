import { useUserContext } from "@context";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    UserCredential,
} from "firebase/auth";
import React, { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { setAuthToken } from "../../apolloClient";
import { auth, googleProvider } from "../firebase";

export const Login: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { setIsLoggedIn } = useUserContext();

    const allowRegistration =
        import.meta.env.VITE_ALLOW_REGISTRATION === "true";

    const handleSuccessfulLogin = async (userCredentials: UserCredential) => {
        const token = await userCredentials.user.getIdToken();
        setAuthToken(token);
        setIsLoggedIn();
        navigate("/");
    };

    const handleLogin = async () => {
        try {
            const userCredentials = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );
            await handleSuccessfulLogin(userCredentials);
        } catch (_e) {
            setError("Failed to log in. Please check your credentials.");
        }
    };

    const handleRegister = async () => {
        try {
            const userCredentials = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            await handleSuccessfulLogin(userCredentials);
        } catch (_e) {
            setError("Failed to register. Please try again.");
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const userCredentials = await signInWithPopup(auth, googleProvider);
            await handleSuccessfulLogin(userCredentials);
        } catch (_e) {
            setError("Failed to sign in with Google. Please try again.");
        }
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleLogin();
    };

    return (
        <Row className="h-100 justify-content-center align-items-center">
            <Col xs="auto">
                <Form
                    onSubmit={onSubmit}
                    className="row-gap-1"
                    data-testid="login-form"
                >
                    <Row>
                        <h3 className="text-center">
                            Welcome to Oracle-Engine
                        </h3>
                    </Row>
                    {allowRegistration && (
                        <>
                            <Form.Group>
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    placeholder="Email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    placeholder="Password"
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />
                            </Form.Group>
                            {error && <p className="text-danger">{error}</p>}
                            <Row className="justify-content-center m-2">
                                <Col xs="auto">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        onClick={handleLogin}
                                    >
                                        Login
                                    </Button>
                                </Col>
                                <Col xs="auto">
                                    <Button
                                        variant="success"
                                        onClick={handleRegister}
                                    >
                                        Register
                                    </Button>
                                </Col>
                            </Row>
                        </>
                    )}
                    <Row>
                        <Button variant="dark" onClick={handleGoogleSignIn}>
                            <Row>
                                <Col xs="auto">
                                    <FontAwesomeIcon icon={faGoogle} />
                                </Col>
                                <Col>Sign in with Google</Col>
                            </Row>
                        </Button>
                    </Row>
                </Form>
            </Col>
        </Row>
    );
};
