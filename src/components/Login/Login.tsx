import { useUserContext } from "@context";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as Sentry from "@sentry/react";
import {
    createUserWithEmailAndPassword,
    getAdditionalUserInfo,
    signInWithEmailAndPassword,
    signInWithPopup,
    UserCredential,
} from "firebase/auth";
import React, { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { setAuthToken } from "../../apolloClient";
import { auth, googleProvider, LogEvent } from "../firebase";

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
        } catch (e) {
            Sentry.captureException(e, {
                tags: { type: "auth", action: "login" },
            });
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
            LogEvent("sign_up", { method: "email" });
            await handleSuccessfulLogin(userCredentials);
        } catch (e) {
            Sentry.captureException(e, {
                tags: { type: "auth", action: "register" },
            });
            setError("Failed to register. Please try again.");
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const userCredentials = await signInWithPopup(auth, googleProvider);
            const additionalInfo = getAdditionalUserInfo(userCredentials);
            if (additionalInfo?.isNewUser) {
                LogEvent("sign_up", { method: "google" });
            }
            await handleSuccessfulLogin(userCredentials);
        } catch (e) {
            Sentry.captureException(e, {
                tags: { type: "auth", action: "google-signin" },
            });
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
