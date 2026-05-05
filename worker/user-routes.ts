import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, ChatBoardEntity, VFSEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { CreateVFSItemRequest, UpdateVFSItemRequest } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/test', (c) => c.json({ success: true, data: { name: 'CF Workers Demo' }}));
  // VFS ENDPOINTS
  app.get('/api/vfs', async (c) => {
    await VFSEntity.ensureSeed(c.env);
    const parentId = c.req.query('parentId') || null;
    const { items } = await VFSEntity.list(c.env);
    const filtered = items.filter(item => item.parentId === (parentId === "null" ? null : parentId));
    return ok(c, filtered);
  });
  app.post('/api/vfs', async (c) => {
    const body = (await c.req.json()) as CreateVFSItemRequest;
    if (!body.name) return bad(c, 'Name is required');
    const newItem = await VFSEntity.create(c.env, {
      id: crypto.randomUUID(),
      name: body.name,
      type: body.type,
      parentId: body.parentId,
      content: body.content || "",
      size: body.content?.length || 0,
      updatedAt: Date.now()
    });
    return ok(c, newItem);
  });
  app.put('/api/vfs/:id', async (c) => {
    const id = c.req.param('id');
    const body = (await c.req.json()) as UpdateVFSItemRequest;
    const entity = new VFSEntity(c.env, id);
    if (!await entity.exists()) return notFound(c);
    const updated = await entity.mutate(s => ({
      ...s,
      ...body,
      updatedAt: Date.now(),
      size: body.content !== undefined ? body.content.length : s.size
    }));
    return ok(c, updated);
  });
  app.delete('/api/vfs/:id', async (c) => {
    const id = c.req.param('id');
    const entity = new VFSEntity(c.env, id);
    if (!await entity.exists()) return notFound(c);
    const state = await entity.getState();
    if (state.type === 'folder') {
      const { items } = await VFSEntity.list(c.env);
      const children = items.filter(i => i.parentId === id);
      for (const child of children) {
        await VFSEntity.delete(c.env, child.id);
      }
    }
    await VFSEntity.delete(c.env, id);
    return ok(c, { deleted: id });
  });
  // USERS
  app.get('/api/users', async (c) => {
    await UserEntity.ensureSeed(c.env);
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await UserEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : undefined);
    return ok(c, page);
  });
  app.post('/api/users', async (c) => {
    const { name } = (await c.req.json()) as { name?: string };
    if (!name?.trim()) return bad(c, 'name required');
    return ok(c, await UserEntity.create(c.env, { id: crypto.randomUUID(), name: name.trim() }));
  });
  app.get('/api/chats', async (c) => {
    await ChatBoardEntity.ensureSeed(c.env);
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await ChatBoardEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : undefined);
    return ok(c, page);
  });
  app.post('/api/chats', async (c) => {
    const { title } = (await c.req.json()) as { title?: string };
    if (!title?.trim()) return bad(c, 'title required');
    const created = await ChatBoardEntity.create(c.env, { id: crypto.randomUUID(), title: title.trim(), messages: [] });
    return ok(c, { id: created.id, title: created.title });
  });
}