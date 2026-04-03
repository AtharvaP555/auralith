const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const sql = require("./prisma");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const avatar = profile.photos?.[0]?.value;

        if (!email) {
          return done(new Error("No email found in Google profile"), null);
        }

        const existing = await sql`
          SELECT * FROM "User" WHERE email = ${email}
        `;

        if (existing.length > 0) {
          if (!existing[0].avatar && avatar) {
            await sql`
              UPDATE "User" SET avatar = ${avatar} WHERE id = ${existing[0].id}
            `;
          }
          return done(null, existing[0]);
        }

        const newUser = await sql`
          INSERT INTO "User" (id, email, password, name, role, avatar, "isVerified", "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), ${email}, ${`google_${profile.id}`}, ${name}, 'USER', ${avatar}, true, NOW(), NOW())
          RETURNING *
        `;

        return done(null, newUser[0]);
      } catch (err) {
        return done(err, null);
      }
    },
  ),
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => done(null, { id }));

module.exports = passport;
