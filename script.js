const { createApp } = Vue;

createApp({
  data() {
    return {
      texto: "",
      link: "",
      resultado: "",
      confianza: "",
      detalles: [],
      consejos: [],
      clickeado: null,
      historial: JSON.parse(localStorage.getItem("historial")) || []
    };
  },
  computed: {
    esPeligroso() {
      return this.resultado.toLowerCase().includes("peligroso");
    }
  },
  methods: {
    analizarTodo() {
      const linksDetectados = this.extraerLinks(this.texto);
      const linkAAnalizar = this.link || linksDetectados[0] || "";
      this.resultado = "";
      this.detalles = [];
      this.consejos = [];
      this.clickeado = null;

      let score = 0;
      if (/verificar|urgente|bloqueada|suspendida/i.test(this.texto)) {
        score += 30;
        this.detalles.push("Uso de lenguaje urgente o alarmante.");
      }
      if (
        /http:\/\//i.test(linkAAnalizar) ||
        /bit\.ly|tinyurl\.com/i.test(linkAAnalizar)
      ) {
        score += 40;
        this.detalles.push("Uso de redirecciones o enlaces acortados.");
      }
      if (/\.(ru|cn|tk|ml|ga)(\/|$)/i.test(linkAAnalizar)) {
        score += 20;
        this.detalles.push("Dominio sospechoso o poco común.");
      }
      if (score >= 60) {
        this.resultado = "⚠️ Posible correo o enlace peligroso";
        this.confianza = "Baja";
        this.consejos.push("No hagas clic en el enlace.");
        this.consejos.push("Reporta este mensaje a tu proveedor.");
      } else if (score >= 30) {
        this.resultado = "⚠️ Podría ser sospechoso";
        this.confianza = "Media";
        this.consejos.push("Revisa con precaución.");
      } else {
        this.resultado = "✅ No parece ser phishing";
        this.confianza = "Alta";
      }

      // Guardar historial
      const nuevo = {
        texto: this.texto,
        link: linkAAnalizar,
        resultado: this.resultado,
        confianza: this.confianza,
        fecha: new Date().toLocaleString()
      };
      this.historial.unshift(nuevo);
      if (this.historial.length > 10) this.historial.pop();
      localStorage.setItem("historial", JSON.stringify(this.historial));
    },
    extraerLinks(texto) {
      const regex = /https?:\/\/[^\s]+/g;
      return texto.match(regex) || [];
    }
  }
}).mount("#app");

