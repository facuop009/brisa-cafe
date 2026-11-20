// All copy for the site lives here so sections stay presentational.
// Sample content (prices, address, phone) — confirm with the client before launch.

export const SITE = {
  name: 'ASA',
  title: 'ASA coffee & flowers',
  line: 'Café en dos plantas, flores en la tercera.',
  address: ['Jægersborggade 41', '2200 København N'],
  phone: '+45 32 14 07 00',
  phoneHref: 'tel:+4532140700',
  email: 'hello@asa-coffee.dk',
  maps: 'https://www.google.com/maps/search/?api=1&query=J%C3%A6gersborggade+41+2200+K%C3%B8benhavn',
  instagram: 'https://www.instagram.com/',
}

export const NAV = [
  { id: 'menu', label: 'Menú' },
  { id: 'featured', label: 'Del mostrador' },
  { id: 'brewing', label: 'Cómo se hace un café' },
  { id: 'house', label: 'La casa' },
  { id: 'flowers', label: 'Flores' },
  { id: 'gallery', label: 'Tres plantas' },
  { id: 'visit', label: 'Visita' },
]

export const MENU = [
  {
    id: 'espresso',
    name: 'Espresso',
    price: '32 kr',
    vessel: 'espresso',
    note: 'Ethiopia Guji, 18 g de entrada y 36 g de salida. Bergamota, albaricoque y un largo final a cacao.',
  },
  {
    id: 'cortado',
    name: 'Cortado',
    price: '38 kr',
    vessel: 'cortado',
    note: 'Espresso y leche vaporizada a partes iguales, servido en un vaso corto en la barra.',
  },
  {
    id: 'flatwhite',
    name: 'Flat white',
    price: '44 kr',
    vessel: 'flatwhite',
    note: 'Un doble ristretto bajo una fina capa de leche aterciopelada, vertida en forma de corazón.',
  },
  {
    id: 'handpour',
    name: 'Hand pour, V60',
    price: '52 kr',
    vessel: 'handpour',
    note: 'Preparado al momento en un V60 de cerámica. Un origen único que cambia cada semana.',
  },
  {
    id: 'colddrip',
    name: 'Kyoto cold drip',
    price: '54 kr',
    vessel: 'colddrip',
    note: 'Goteo gota a gota durante ocho horas, servido sobre una esfera de hielo transparente.',
  },
  {
    id: 'hojicha',
    name: 'Hojicha latte',
    price: '46 kr',
    vessel: 'hojicha',
    note: 'Té verde japonés tostado con leche de avena vaporizada. Tostado, dulce, bajo en cafeína.',
  },
  {
    id: 'matcha',
    name: 'Ceremonial matcha',
    price: '56 kr',
    vessel: 'matcha',
    note: 'Hoja de primera cosecha de Uji, batida al momento en un cuenco hecho a mano.',
  },
  {
    id: 'icedlatte',
    name: 'Iced oat latte',
    price: '48 kr',
    vessel: 'icedlatte',
    note: 'Un doble espresso sobre leche de avena y hielo, preparado delante de ti.',
  },
]

export const FEATURED = [
  {
    id: 'blend',
    name: 'Morning Blend',
    variant: '250 g, grano entero',
    fact: '125 kr',
    body: 'Cafés lavados de Huila y Guji, tostados cada martes para lograr viveza sin amargor.',
    image: 'renders/feat-blend.jpg',
    thumb: 'renders/thumb-blend.jpg',
    alt: 'Una bolsa kraft del Morning Blend junto al molinillo en el mostrador de roble',
    action: { label: 'Reservar una bolsa', href: 'mailto:hello@asa-coffee.dk?subject=Reserve%20Morning%20Blend%20250%20g&body=Hola%20ASA%2C%0A%0AQuisiera%20reservar%20una%20bolsa%20de%20Morning%20Blend%20para%20recoger%20el%20' },
  },
  {
    id: 'knot',
    name: 'Cardamom knot',
    variant: 'Horneado aquí a las 06:00',
    fact: '36 kr',
    body: 'Masa de mantequilla retorcida con cardamomo verde molido y azúcar perlado. Suele agotarse antes de las once.',
    image: 'renders/feat-knot.jpg',
    thumb: 'renders/thumb-knot.jpg',
    alt: 'Lazos de cardamomo y croissants en la vitrina de cristal',
    action: { label: 'Reservarme dos', href: 'mailto:hello@asa-coffee.dk?subject=Reservar%20dos%20lazos%20de%20cardamomo&body=Hola%20ASA%2C%0A%0APor%20favor%20resérvame%20dos%20lazos%20de%20cardamomo%20para%20el%20' },
  },
  {
    id: 'bouquet',
    name: 'Morning bunch',
    variant: 'De la florista, segunda planta',
    fact: '145 kr',
    body: 'Una sola variedad, cortada esa mañana y envuelta en papel kraft mientras te sirven el café.',
    image: 'renders/feat-bouquet.jpg',
    thumb: 'renders/thumb-bouquet.jpg',
    alt: 'Cubos de flores rosas y amarillas en el expositor de roble de la planta de la florista',
    action: { label: 'Pedir un ramo', href: 'mailto:flowers@asa-coffee.dk?subject=Ramo%20de%20ma%C3%B1ana&body=Hola%20ASA%20Flores%2C%0A%0AQuisiera%20un%20ramo%20de%20ma%C3%B1ana%20para%20recoger%20el%20' },
  },
]

export const BREWING = [
  {
    caption: 'Empieza como fruta',
    text: 'El café es la semilla de una cereza roja. El nuestro se recoge a mano a 1.900 metros en Guji, Etiopía.',
    image: 'images/origin-cherries.jpg',
    alt: 'Cerezas de café rojas y maduras en una rama entre hojas verdes',
    w: 1050, h: 1400, gap: 120,
  },
  {
    caption: 'Luego un tueste lento',
    text: 'Solo los martes: lo suficientemente ligero para conservar la fruta, lo suficientemente largo para perder el heno.',
    image: 'images/roast-beans.jpg',
    alt: 'Granos de café ligeramente tostados en un cuenco de cerámica blanca',
    w: 1400, h: 1400, gap: 56,
  },
  {
    caption: 'La barra preparada',
    text: 'Hervidor a 94 °C, papel enjuagado, báscula a cero. Nada en la barra que no se use.',
    image: 'images/setup-equipment.jpg',
    alt: 'Un dripper, hervidor, molinillo y báscula dispuestos sobre una mesa de madera',
    w: 933, h: 1400, gap: 140,
  },
  {
    caption: 'Un bloom de cuarenta segundos',
    text: 'Cincuenta gramos de agua despiertan el café molido. El lecho se expande al escapar el gas.',
    image: 'images/bloom-topdown.jpg',
    alt: 'Vista desde arriba: un hervidor de cobre vierte agua sobre el café en bloom',
    w: 1400, h: 932, gap: 80,
  },
  {
    caption: 'Tres círculos lentos',
    text: 'Vertemos en pulsos hasta que la báscula marca 300 g, unos tres minutos y medio.',
    image: 'images/pour-kettle.jpg',
    alt: 'Un hervidor de cuello de ganso vierte un hilo fino sobre un dripper de cerámica en la báscula',
    w: 933, h: 1400, gap: 112,
  },
  {
    caption: 'Servido en roble',
    text: 'En la ventana, sobre una tabla cortada del mismo roble blanco que el suelo bajo tus pies.',
    image: 'renders/brew-serve.jpg',
    alt: 'Un flat white en la mesa larga de roble junto a la ventana de lamas',
    w: 1200, h: 1500, gap: 64,
  },
]

export const FLOORS = [
  { id: 'cafe', level: 'Planta baja', name: 'Café', text: 'En la planta baja: la barra de espresso con azulejo esmaltado amarillo, una vitrina de bollería y un alféizar de roble junto a la ventana.' },
  { id: 'lounge', level: 'Primera planta', name: 'Salón', text: 'Un piso más arriba: la mesa larga junto a las lamas, un banco de lino rosa y sin música antes de las nueve.' },
  { id: 'florist', level: 'Segunda planta', name: 'Florista', text: 'En lo alto: ASA Flores, con cubos en un expositor de roble de tres niveles y tallos secos colgando de las vigas.' },
]

export const HOUSE_FACTS = [
  { label: 'Plantas', value: '3, unidas por una escalera de roble' },
  { label: 'Asientos', value: '28 en dos plantas' },
  { label: 'Techos', value: '4,2 metros en cada planta' },
  { label: 'Hora local', value: 'live' },
]

export const FLOWERS = {
  intro:
    'ASA Flores ocupa la planta superior: tallos cortados de productores de Funen y Zealand, atados al momento mientras tu café se enfría. Esta semana los cubos tienen ranúnculos, mimosa, rosas de jardín y las primeras ramas de cerezo.',
  list: [
    { name: 'Ramo de mañana', note: 'Una sola variedad, envuelta en papel kraft', price: '145 kr' },
    { name: 'Ramo de temporada', note: 'Una mezcla elegida de los cubos ese día', price: '295 kr' },
    { name: 'Centro de mesa', note: 'Para una cena, un escritorio o una ocasión', price: '545 kr' },
    { name: 'Flores semanales', note: 'Un ramo cada viernes, retirado con el café', price: '450 kr al mes' },
  ],
  hours: 'Florista abierta de martes a sábado, 09:00 – 17:00',
  email: 'flowers@asa-coffee.dk',
  image: 'renders/flowers-floor.jpg',
  alt: 'The florist floor: a three-tier oak stand of flower buckets, dried flowers hanging from the beams',
  detail: 'renders/flowers-detail.jpg',
  detailAlt: 'Close view of pink and yellow ranunculus in galvanised buckets',
}

export const GALLERY = [
  { image: 'renders/gallery-cafe.jpg', caption: 'Planta baja, 07:20: primera luz en la barra de espresso', alt: 'La planta del café con el sol bajo de la mañana, sombras de lamas sobre el mostrador de azulejo amarillo' },
  { image: 'renders/gallery-lounge.jpg', caption: 'Primera planta, 12:40: mediodía en la mesa larga', alt: 'El salón al mediodía, líneas cortas de luz junto a la mesa larga de roble' },
  { image: 'renders/gallery-florist.jpg', caption: 'Segunda planta, 17:50: la florista bajo las lámparas de papel', alt: 'La planta de la florista al atardecer, iluminada por faroles de papel' },
]
