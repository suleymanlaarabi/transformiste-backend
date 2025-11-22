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
  nodes: Node[];
  votes: number[];
};

type GameState = {
  players: Map<string, Player>;
  timer: number;
};

const TIMER = 100;

const gameState: GameState = {
  players: new Map(),
  timer: TIMER,
};

setInterval(() => {
  gameState.timer -= 1;
  if (gameState.timer < -(gameState.players.size * 20)) {
    gameState.timer = TIMER;
    gameState.players.clear();
  }
}, 1000);

function getPlayerOrCreate(name: string) {
  const player = gameState.players.get(name);
  if (player) return player;
  const newPlayer: Player = {
    name,
    bodyColor: "#000000",
    edgeColor: "#7b7bffff",
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
  .get("/get-timer", () => gameState.timer)
  .put("/reset-timer", () => (gameState.timer = 100))
  .get("/players", () => {
    return Array.from(gameState.players.values());
  })
  .post(
    "/set-color",
    ({ body: { body, edge, name } }) => {
      const player = getPlayerOrCreate(name);
      player.bodyColor = body;
      player.edgeColor = edge;
    },
    {
      body: t.Object({
        body: t.String(),
        edge: t.String(),
        name: t.String(),
      }),
    }
  )
  .listen(3000);

export type App = typeof app;
