
// src/lib/eras-config.ts
import type { Era } from '@/types';
import { Sunrise, Zap, Shield, BookOpen, Mountain } from 'lucide-react';

export const ALL_ERAS_DATA: Era[] = [
  {
    id: 'era_0_prologo',
    nombre: 'Prólogo: El Llamado',
    descripcion: "Un susurro en el viento, una inquietud en el alma. Sientes que un camino diferente te aguarda, uno de crecimiento y autodescubrimiento. Este es el primer paso.",
    descripcionCompletada: "Has escuchado el llamado y te has puesto en marcha. Las primeras pruebas han sido superadas, pero esto es solo el comienzo de tu gran saga.",
    objetivos: [
      { id: 'obj0_1', description: "Configura tu perfil de EXILE por completo." },
      { id: 'obj0_2', description: "Añade tu primer hábito diario." },
      { id: 'obj0_3', description: "Completa un hábito por primera vez." },
    ],
    condiciones_completado_desc: "Completa todos los objetivos del Prólogo.",
    mecanicas_especiales_desc: "Ninguna en esta etapa introductoria.",
    recompensas: [
      { type: 'xp', description: "+50 XP por iniciar tu viaje.", value: 50 },
      { type: 'unlock', description: "Desbloqueo de la primera Era: El Despertar del Iniciado" },
    ],
    tema_visual: {
      colorPrincipal: 'text-gray-400',
      icono: Sunrise,
    },
    siguienteEraId: 'era_1_despertar',
    xpRequeridoParaIniciar: 0,
  },
  {
    id: 'era_1_despertar',
    nombre: 'El Despertar del Iniciado',
    descripcion: "La niebla de la inacción se disipa. Comienzas a forjar rutinas, a entender el poder de la constancia. Cada pequeño paso es una victoria en la construcción de tu nueva fortaleza interior.",
    descripcionCompletada: "Las cadenas de la inercia se han roto. Has despertado a tu potencial y las primeras disciplinas se asientan en tu ser. El camino del iniciado se abre ante ti.",
    objetivos: [
      { id: 'obj1_1', description: "Mantén una racha de 3 días en al menos un hábito." },
      { id: 'obj1_2', description: "Acumula 100 XP total." },
      { id: 'obj1_3', description: "Define tu primera Meta S.M.A.R.T." },
    ],
    condiciones_completado_desc: "Alcanza el Rango 'Hombre' (100 XP) y completa los objetivos listados.",
    mecanicas_especiales_desc: "Ganas un 10% extra de XP por completar hábitos de 'Salud Física'.",
    recompensas: [
      { type: 'xp', description: "+100 XP por dominar los fundamentos.", value: 100 },
      { type: 'item', description: "Obtienes el 'Amuleto del Iniciado'. (Funcionalidad de ítems futura)" },
    ],
    tema_visual: {
      colorPrincipal: 'text-sky-400',
      icono: Zap,
    },
    siguienteEraId: 'era_2_disciplina',
    xpRequeridoParaIniciar: 50,
  },
  {
    id: 'era_2_disciplina',
    nombre: 'La Forja de la Disciplina',
    descripcion: "El verdadero poder no nace del talento innato, sino del crisol de la disciplina. Enfrenta la resistencia, moldea tu voluntad y observa cómo lo difícil se vuelve alcanzable.",
     descripcionCompletada: "Tu voluntad es acero templado. La disciplina es ahora tu aliada, no tu carcelera. Estás listo para desafíos mayores.",
    objetivos: [
      { id: 'obj2_1', description: "Completa 5 hábitos diferentes en una semana." },
      { id: 'obj2_2', description: "Alcanza una racha de 7 días en un hábito clave." },
      { id: 'obj2_3', description: "Completa tu primera Meta S.M.A.R.T." },
    ],
    condiciones_completado_desc: "Alcanza el Rango 'Hombre de alto valor' (500 XP) y completa los objetivos.",
    mecanicas_especiales_desc: "Los hábitos de la categoría 'Productividad' otorgan el doble de XP.",
    recompensas: [
      { type: 'xp', description: "+250 XP por tu férrea voluntad.", value: 250 },
      { type: 'attribute_boost', description: "Disciplina +5. (Funcionalidad futura)", attributeName: "Disciplina", value: 5 },
    ],
    tema_visual: {
      colorPrincipal: 'text-red-500',
      icono: Shield,
    },
    siguienteEraId: 'era_3_conocimiento',
    xpRequeridoParaIniciar: 150,
  },
  {
    id: 'era_3_conocimiento',
    nombre: 'Senderos del Conocimiento',
    descripcion: "La mente es un jardín que debe ser cultivado. Busca la sabiduría, expande tus horizontes y aprende de cada experiencia. El conocimiento es una luz en la oscuridad.",
    descripcionCompletada: "Has abierto tu mente a nuevos aprendizajes. La curiosidad es tu guía y el conocimiento tu herramienta más poderosa.",
    objetivos: [
        { id: 'obj3_1', description: "Dedica tiempo a leer o aprender algo nuevo durante 5 días." },
        { id: 'obj3_2', description: "Registra tu sueño durante 7 días consecutivos." },
        { id: 'obj3_3', description: "Reflexiona sobre una 'Chispa de Motivación' y anota tus pensamientos."}
    ],
    condiciones_completado_desc: "Alcanza el Rango 'Héroe' (1500 XP) y explora nuevas áreas de desarrollo.",
    mecanicas_especiales_desc: "Los hábitos de 'Desarrollo Mental' y 'Conocimiento' (si se añade) otorgan +5 XP adicional.",
    recompensas: [
        { type: 'xp', description: "+500 XP por tu búsqueda de sabiduría.", value: 500 },
        { type: 'unlock', description: "Desbloqueo de la sección 'Biblioteca Arcana' (Funcionalidad futura)."}
    ],
    tema_visual: {
        colorPrincipal: 'text-purple-400',
        icono: BookOpen,
    },
    siguienteEraId: 'era_4_maestria',
    xpRequeridoParaIniciar: 750,
  },
  {
    id: 'era_4_maestria',
    nombre: 'La Cima de la Maestría',
    descripcion: "Has recorrido un largo camino. La maestría no es un destino, sino un compromiso constante con la excelencia. Consolida tu poder, inspira a otros y prepárate para lo que vendrá.",
    descripcionCompletada: "La maestría fluye en ti. Te has convertido en un faro de tu propio desarrollo, pero sabes que el viaje nunca termina realmente.",
    objetivos: [
        { id: 'obj4_1', description: "Alcanza una racha de 30 días en un hábito fundamental." },
        { id: 'obj4_2', description: "Completa 3 Metas S.M.A.R.T. desafiantes." },
        { id: 'obj4_3', description: "Ayuda o aconseja a alguien en su propio camino de desarrollo (simulado o real)." }
    ],
    condiciones_completado_desc: "Alcanza el Rango 'Superheroe' (5000 XP) y demuestra tu dominio.",
    mecanicas_especiales_desc: "Todas las fuentes de XP otorgan un 5% adicional.",
    recompensas: [
        { type: 'xp', description: "+1000 XP por alcanzar la cúspide.", value: 1000 },
        { type: 'item', description: "Obtienes la 'Corona del Autarca'. (Funcionalidad futura)"}
    ],
    tema_visual: {
        colorPrincipal: 'text-yellow-400',
        icono: Mountain,
    },
    siguienteEraId: null, // Última era definida por ahora
    xpRequeridoParaIniciar: 2000,
  }
];
