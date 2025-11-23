import cors from "@elysiajs/cors";
import { Elysia, t } from "elysia";

type Node = {
  name: string;
  position: [number, number, number];
};

type Player = {
  name: string;
  bodyColor: string;
  edgeColor: string;
  carroserie: string;
  nodes: Node[];
  votes: number[];
};

type GameState = {
  players: Map<string, Player>;
  timer: number;
  theme: string;
};

const themes: string[] = [
  "Cirque",
  "Maison",
  "Chien",
  "Chat",
  "Arbre",
  "Voiture",
  "Fusée",
  "Plage",
  "Pirate",
  "Château",
  "Robot",
  "Fleur",
  "Poisson",
  "Ferme",
  "Dragon",
  "Espace",
  "Cheval",
  "Magie",
  "Pizza",
  "Carnaval",
];

const TIMER = 200;

function getTheme() {
  return themes[Math.round(Math.random() * themes.length)] || "jsp";
}

const gameState: GameState = {
  players: new Map(),
  timer: TIMER,
  theme: getTheme(),
};

setInterval(() => {
  gameState.timer -= 1;
}, 1000);

function getPlayerOrCreate(name: string) {
  const player = gameState.players.get(name);
  if (player) return player;
  const newPlayer: Player = {
    name,
    bodyColor: "#000000",
    edgeColor: "#7b7bffff",
    carroserie: "carroserie/Car_Basique",
    nodes: [],
    votes: [],
  };
  gameState.players.set(name, newPlayer);
  return newPlayer;
}

const app = new Elysia()
  .use(cors())
  .get("/game-state", gameState)
  .post(
    "/register",
    ({ body: { name } }) => {
      gameState.players.set(name, {
        name,
        bodyColor: "#000000",
        edgeColor: "#7b7bffff",
        carroserie: "carroserie/Car_Basique",
        nodes: [],
        votes: [],
      });
    },
    {
      body: t.Object({
        name: t.String(),
      }),
    }
  )
  .put("/restart", () => {
    gameState.timer = TIMER;
    gameState.players = new Map();
    gameState.theme = getTheme();
  })
  .post(
    "/register-nodes",
    ({ body: { name, nodes } }) => {
      const player = getPlayerOrCreate(name);
      player.nodes = nodes as Player["nodes"];
    },
    {
      body: t.Object({
        name: t.String(),
        nodes: t.Array(
          t.Object({ name: t.String(), position: t.Array(t.Number()) })
        ),
      }),
    }
  )
  .post(
    "/vote",
    ({ body: { name, stars } }) => {
      const player = getPlayerOrCreate(name);
      player.votes.push(stars);
    },
    {
      body: t.Object({
        name: t.String(),
        stars: t.Number(),
      }),
    }
  )
  .get("/theme", () => gameState.theme)
  .get("/get-timer", () => gameState.timer)
  .put("/reset-timer", () => (gameState.timer = 100))
  .get("/players", () => {
    return Array.from(gameState.players.values());
  })
  .post(
    "/set-color",
    ({ body: { body, edge, name, carroserie } }) => {
      const player = getPlayerOrCreate(name);
      player.bodyColor = body;
      player.edgeColor = edge;
      player.carroserie = carroserie;
    },
    {
      body: t.Object({
        body: t.String(),
        edge: t.String(),
        carroserie: t.String(),
        name: t.String(),
      }),
    }
  )
  .listen(3000);

export type App = typeof app;
