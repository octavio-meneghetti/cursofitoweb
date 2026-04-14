export const mockLessons = [
  {
    id: "auto-0-0",
    title: "Entrar al mundo vivo",
    screens: [
      {
        id: "p0",
        template: "T01_NARRATIVE",
        data: {
          character: "El Guardián",
          text: "“Sin territorio no hay medicina. Hoy empezás a mirar lo que sostiene todo.”",
          accentColor: "var(--color-guardian)",
          image: "/guardian.png"
        }
      },
      {
        id: "p1",
        template: "T01_NARRATIVE",
        data: {
          character: "El Guardián",
          text: "“No vas a aprender a extraer. Vas a aprender a DEVOLVER.”",
          accentColor: "var(--color-guardian)",
          image: "/guardian.png"
        }
      },
      {
        id: "p2",
        template: "T02_QUIZ_SELECT",
        data: {
          character: "El Guardián",
          pregunta: "¿Por qué es importante observar el entorno antes de recolectar?",
          opciones: [
            "Para encontrar la planta más grande",
            "Para entender la salud del territorio",
            "Para terminar rápido la misión"
          ],
          correctIndex: 1,
          feedback: "¡Exacto! Un buen terapeuta cuida el lugar donde nace la medicina.",
          accentColor: "var(--color-guardian)"
        }
      }
    ]
  }
];
