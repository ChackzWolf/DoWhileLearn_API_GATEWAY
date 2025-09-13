import admin from "firebase-admin";

// Initialize once at server startup
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

export const googleAuthHandler = async (data:{idToken:string, role:string}) => {
  try {
    const { idToken, role } = data;

    // Verify ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log(decodedToken, "decoded Token")
    const { email, name, picture, uid } = decodedToken;

  } catch (err) {
    console.error("Google Auth Error:", err);
  }
};
