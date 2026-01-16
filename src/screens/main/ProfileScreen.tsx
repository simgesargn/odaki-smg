import React, { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

export const ProfileScreen: React.FC = () => {
  const { user } = useUser();
  const uid = user?.uid ?? null;
  const [avatarEmoji, setAvatarEmoji] = useState<string>("🙂");
  const [usernameField, setUsernameField] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!uid) return;
      try {
        const ref = doc(db, "users", uid);
        const snap = await getDoc(ref);
        if (!mounted) return;
        const data: any = snap.exists() ? snap.data() : {};
        setAvatarEmoji(data?.avatarEmoji ?? "🙂");
        setUsernameField(data?.username ?? user?.displayName ?? user?.email?.split?.("@")?.[0] ?? null);
      } catch (e) {
        // ignore, keep defaults
      }
    })();
    return () => {
      mounted = false;
    };
  }, [uid, user]);

  return (
    <View style={styles.headerCard}>
      {/* avatar emoji (large) */}
      <View style={{ marginRight: 14, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 48 }}>{avatarEmoji}</Text>
      </View>
      <View>
        <Text style={styles.name}>{usernameField ?? user?.displayName ?? "Kullanıcı"}</Text>
        {user?.email ? <Text variant="muted">{user.email}</Text> : null}
      </View>
    </View>
  );
};
