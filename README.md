# Reporte de Jornada Pro

Aplicación web progresiva en español para crear reportes de jornada, configurar pruebas, obtener una vista previa, descargar una imagen PNG de alta resolución y compartir por WhatsApp.

## Uso en computadora

Abre **index.html** con un navegador moderno. El formulario y la generación de reportes funcionan sin conexión. La página local no activa la instalación PWA ni la caché de servicio del navegador.

## Uso móvil e instalación

Para añadirla a la pantalla de inicio y volver a abrirla sin internet en Android o iPhone, el navegador requiere una primera visita a una dirección web HTTPS. GitHub no es obligatorio y no hace falta instalar una aplicación adicional en el teléfono, pero la carpeta debe estar publicada en algún alojamiento web HTTPS. Esta carpeta por sí sola no crea una dirección pública.

- **Android:** abre la dirección HTTPS en Chrome y elige **Instalar app** o **Añadir a pantalla de inicio**.
- **iPhone/iPad:** abre la dirección HTTPS en Safari, toca **Compartir → Añadir a pantalla de inicio**, activa **Abrir como app web** y toca **Añadir**.
- Espera a que aparezca **Lista para usar sin conexión** antes de desconectarte. La aplicación y los reportes funcionarán offline; WhatsApp requiere internet.

El borrador y las pruebas configurables se guardan solo en el dispositivo actual. No se sincronizan entre teléfono y computadora. La imagen se genera con gráficos vectoriales y se exporta en alta resolución.