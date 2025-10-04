import { setupServer } from "msw/node";

export const server = setupServer();

export const boundary = server.boundary.bind(server);
