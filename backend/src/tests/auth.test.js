const request = require('supertest');
const app = require('../app');

describe('Auth Routes', () => {
  it('POST /api/auth/login - deve retornar erro com credenciais inválidas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'invalido@test.com', senha: 'errada' });
    expect(res.status).toBe(401);
  });

  it('POST /api/auth/login - deve retornar erro de validação sem email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ senha: '123456' });
    expect(res.status).toBe(400);
  });

  it('GET /api/auth/me - deve retornar 401 sem token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
