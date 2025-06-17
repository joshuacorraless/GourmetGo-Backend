const chatbotResponses = {
  "hola": "¡Hola! Bienvenido a GourmetGo. Puedes preguntarme sobre: 'reservar', 'menu', 'ubicación', 'calificar', 'experiencias disponibles', 'cómo funciona el QR', 'enviar correo', 'promociones', 'cambiar datos de reserva', 'cómo registrarme', 'fecha válida' o 'cancelar reserva'.",
  "reservar": "Para realizar una reserva, abre la app y ve a 'Mis Reservas' > 'Nueva Reserva'. Elige el evento y el número de personas, luego confirma.",
  "menu": "Puedes ver el menú en la sección 'Experiencias', seleccionando el evento que más te guste. El menú estará disponible en la descripción del evento.",
  "ubicación": "La ubicación del evento será visible en la página de cada experiencia, junto con un enlace interactivo para Google Maps o Waze.",
  "calificar": "Después de asistir a una experiencia, ve a 'Mis Reservas', selecciona la experiencia que asististe y califícala con estrellas y comentarios. ¡También puedes agregar imágenes!",
  "experiencias disponibles": "Puedes ver todas las experiencias disponibles en la pantalla principal de la app. Usa los filtros para ordenar por fecha, precio y tipo.",
  "cómo funciona el QR": "El código QR es tu confirmación de reserva. Lo recibirás por correo y podrás escanearlo al llegar al evento para confirmar tu asistencia.",
  "enviar correo": "Recibirás un correo con todos los detalles de tu reserva, incluyendo fecha, hora, ubicación, y un código QR. Asegúrate de revisar tu bandeja de entrada.",
  "promociones": "Para ver las promociones vigentes, visita la sección de 'Promociones' en la app o consulta la información en tu correo de confirmación.",
  "cambiar datos de reserva": "Para cambiar los datos de una reserva, ve a 'Mis Reservas' y selecciona la experiencia. Luego, podrás modificar el número de personas o cancelar la reserva.",
  "cómo registrarme": "Para registrarte, abre la app y ve a 'Registro'. Ingresa tu nombre, correo, teléfono y contraseña. Asegúrate de que todos los campos sean correctos.",
  "fecha válida": "Recuerda que solo se pueden reservar experiencias con fechas futuras. Si eliges una fecha pasada, el sistema te alertará para que la modifiques.",
  "cancelar reserva": "Si necesitas cancelar tu reserva, ve a 'Mis Reservas' y selecciona la opción de cancelar. Recibirás un correo confirmando la cancelación.",
  "default": "Lo siento, no entendí. Escribe 'hola' para ver opciones.",
  "charlie" : "jaja" 
};

exports.handleMessage = (req, res) => {
  const userMessage = req.body.message?.toLowerCase() || "";
  const reply = chatbotResponses[userMessage] || chatbotResponses.default;
  res.json({ reply });
};