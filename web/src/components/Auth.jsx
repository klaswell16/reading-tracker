import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

function Auth({ onUserChange }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      onUserChange(currentUser);
    });
    return unsubscribe;
  }, [onUserChange]);

  const signUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      onUserChange(userCredential.user);
    } catch (error) {
      console.error(error);
    }
  };

  const signIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      onUserChange(userCredential.user);
    } catch (error) {
      console.error(error);
    }
  };

  const logOut = async () => {
    await signOut(auth);
    setUser(null);
    onUserChange(null);
  };

  if (user) {
    return (
      <div className="welcome-message">
        <p>Welcome, {user.email}</p>
        <button onClick={logOut}>Log Out</button>
      </div>
    );
  }

  return (
    <div className="auth-section">
      <h2>Authentication</h2>
      <div className="auth-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <div className="auth-buttons">
          <button onClick={signUp}>Sign Up</button>
          <button onClick={signIn}>Sign In</button>
        </div>
      </div>
    </div>
  );
}

export default Auth;