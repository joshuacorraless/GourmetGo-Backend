const chatbotResponses = {
  "hola": "¡Hola! Bienvenido a GourmetGo. ¿Necesitas ayuda con reservas, menú o promociones?",
  "reservar": "Para reservar, ve a 'Mis Reservas' > 'Nueva Reserva' en la app.",
  "menu": "Puedes ver el menú en la sección 'Categorías'.",
  "default": "Lo siento, no entendí. Escribe 'hola' para ver opciones.",
  "Como reservar" : "Minecraft"
};

exports.handleMessage = (req, res) => {
  const userMessage = req.body.message?.toLowerCase() || "";
  const reply = chatbotResponses[userMessage] || chatbotResponses.default;
  res.json({ reply });
};