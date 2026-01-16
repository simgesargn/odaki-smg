export const demoUserStats = {
  totalFocusMinutes: 540,
  completedSessions: 18,
  completedTasks: 44,
  streakDays: 5,
  totalFlowers: 4,
};

export const demoWeekly = Array.from({ length: 7 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (6 - i));
  return {
    dateLabel: d.toLocaleDateString("tr-TR", { weekday: "short", day: "numeric" }),
    minutes: [0, 20, 35, 10, 45, 30, 60][i % 7],
    tasks: [0, 1, 2, 0, 3, 1, 4][i % 7],
  };
});

export const demoFlowers = [
  { id: "f1", type: "lotus", label: "Lotus", emoji: "🪷" },
  { id: "f2", type: "sunflower", label: "Ayçiçeği", emoji: "🌻" },
  { id: "f3", type: "orchid", label: "Orkide", emoji: "🌸" },
  { id: "f4", type: "seed", label: "Tohum", emoji: "🌱" },
];

export const demoNotifications = [
  { id: "n1", title: "Günlük hedef tamamlandı", body: "Bugünkü hedefini başarıyla tamamladın.", time: Date.now() - 3600_000, type: "success" },
  { id: "n2", title: "Yeni başarı", body: "3 günlük seri oluşturuldu!", time: Date.now() - 7200_000, type: "info" },
  { id: "n3", title: "Hatırlatma", body: "Odak seansını başlatmayı unutma.", time: Date.now() - 86_400_000, type: "warn" },
];

export const demoFriends = [
  { id: "u1", name: "Ayşe", username: "ayse", status: "Çevrimiçi", emoji: "🙂" },
  { id: "u2", name: "Mehmet", username: "mehmet", status: "Son aktif 2s önce", emoji: "😎" },
  { id: "u3", name: "Ece", username: "ece", status: "Çevrimdışı", emoji: "🌱" },
];

export const demoActivity = [
  { id: "a1", user: "Ayşe", text: "25 dk odaklandı", ts: Date.now() - 1000 * 60 * 60 },
  { id: "a2", user: "Mehmet", text: "1 görev tamamladı", ts: Date.now() - 1000 * 60 * 60 * 3 },
];
