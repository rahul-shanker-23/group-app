import mongoose from "mongoose";
import Group from "../models/groupModel.js";
import User from "../models/userModel.js";
import Message from "../models/messageModel.js";
import { expect } from "chai";
import request from "supertest";
import app from "../app.js";
let token;

before(async () => {
  await Group.collection.drop();
  await User.collection.drop();
  await Message.collection.drop();

  // create user
  await User.create([
    {
      name: "admin",
      email: "admin@gmail.com",
      role: "admin",
      password: "admin@52",
      passwordConfirm: "admin@52",
    },
    {
      name: "rahul",
      email: "rahul@gmail.com",
      password: "rahul@52",
      passwordConfirm: "rahul@52",
    },
    {
      name: "pragya",
      email: "pragya@gmail.com",
      password: "pragya@23",
      passwordConfirm: "pragya@23",
    },
  ]);

  // create group
  await Group.create([
    {
      name: "test-group",
      owner: "rahul@gmail.com",
    },
    {
      name: "test-group-1",
      owner: "pragya@gmail.com",
    },
  ]);
  const data = {
    email: "rahul@gmail.com",
    password: "rahul@52",
  };

  const res = await request(app).post("/api/v1/users/login").send(data);
  token = res.body.token;
});

after(async () => {
  await Group.collection.drop();
  await User.collection.drop();
  await Message.collection.drop();
  await mongoose.disconnect();
});

describe("GROUP", () => {
  const agent = request.agent(app);
  it("should create group", async () => {
    const data = {
      name: "test-group-2",
    };

    const res = await agent
      .post("/api/v1/groups")
      .set("Cookie", `jwt=${token}`)
      .send(data);
    expect(res.statusCode).equal(201);
    expect(res.body.status).equal("success");
    expect(res.body.data.group.name).equal("test-group-2");
    expect(res.body.data.group.owner).equal("rahul@gmail.com");
    expect(res.body.data.group.users.length).equal(0);
  });

  it("should not create group", async () => {
    const data = {
      name: "test-group-2",
    };

    const res = await agent
      .post("/api/v1/groups")
      .set("Cookie", `jwt=${token}`)
      .send(data);
    expect(res.statusCode).equal(500);
    expect(res.body.status).equal("error");
  });

  it("should create group with integer value", async () => {
    const data = {
      name: 12345,
    };

    const res = await agent
      .post("/api/v1/groups")
      .set("Cookie", `jwt=${token}`)
      .send(data);
    expect(res.statusCode).equal(201);
    expect(res.body.status).equal("success");
    expect(res.body.data.group.name).equal("12345");
    expect(res.body.data.group.owner).equal("rahul@gmail.com");
    expect(res.body.data.group.users.length).equal(0);
  });

  it("should not create group if already created", async () => {
    const data = {};

    const res = await agent
      .post("/api/v1/groups")
      .set("Cookie", `jwt=${token}`)
      .send(data);
    expect(res.statusCode).equal(500);
    expect(res.body.status).equal("error");
  });

  it("should view all groups", async () => {
    const res = await agent.get("/api/v1/groups").set("Cookie", `jwt=${token}`);
    expect(res.statusCode).equal(200);
    expect(res.body.status).equal("success");
    expect(res.body.data.group.length).equal(4);
  });

  it("should view single groups", async () => {
    const res = await agent
      .get("/api/v1/groups/test-group")
      .set("Cookie", `jwt=${token}`);
    expect(res.statusCode).equal(200);
    expect(res.body.status).equal("success");
    expect(res.body.data.group.name).equal("test-group");
  });

  it("should not view single group", async () => {
    const res = await agent
      .get("/api/v1/groups/test-group-5")
      .set("Cookie", `jwt=${token}`);
    expect(res.statusCode).equal(500);
    expect(res.body.status).equal("error");
    expect(res.body.message).equal("group not exists!");
  });

  it("should delete group", async () => {
    const res = await agent
      .delete("/api/v1/groups/12345")
      .set("Cookie", `jwt=${token}`);
    expect(res.statusCode).equal(204);
  });

  it("should not delete group", async () => {
    const res = await agent
      .delete("/api/v1/groups/test-group-5")
      .set("Cookie", `jwt=${token}`);
    expect(res.statusCode).equal(500);
    expect(res.body.status).equal("error");
    expect(res.body.message).equal("group not exists!");
  });

  it("should add user to the group", async () => {
    const data = {
      email: "pragya@gmail.com",
      group: "test-group",
    };

    const res = await agent
      .post("/api/v1/groups/add")
      .set("Cookie", `jwt=${token}`)
      .send(data);
    expect(res.statusCode).equal(201);
    expect(res.body.status).equal("success");
    expect(res.body.data.group.users[0]).equal("pragya@gmail.com");
    expect(res.body.data.group.name).equal("test-group");
  });

  it("should not add user if group not exists", async () => {
    const data = {
      email: "pragya@gmail.com",
      group: "test-group-5",
    };

    const res = await agent
      .post("/api/v1/groups/add")
      .set("Cookie", `jwt=${token}`)
      .send(data);
    expect(res.statusCode).equal(500);
    expect(res.body.status).equal("error");
    expect(res.body.message).equal("group not exists!");
  });

  it("should not add user if user not exists", async () => {
    const data = {
      email: "gautam@gmail.com",
      group: "test-group",
    };

    const res = await agent
      .post("/api/v1/groups/add")
      .set("Cookie", `jwt=${token}`)
      .send(data);
    expect(res.statusCode).equal(500);
    expect(res.body.status).equal("error");
    expect(res.body.message).equal("user not exists!");
  });

  it("should not add user if user already added", async () => {
    const data = {
      email: "pragya@gmail.com",
      group: "test-group",
    };

    const res = await agent
      .post("/api/v1/groups/add")
      .set("Cookie", `jwt=${token}`)
      .send(data);
    expect(res.statusCode).equal(500);
    expect(res.body.status).equal("error");
    expect(res.body.message).equal("user already exits!");
  });
});

describe("MESSAGE", () => {
  const agent = request.agent(app);
  it("should send a message to the group", async () => {
    const data = {
      group: "test-group",
      message: "Hello Sayonara",
    };

    const res = await agent
      .post("/api/v1/messages")
      .set("Cookie", `jwt=${token}`)
      .send(data);
    expect(res.statusCode).equal(201);
    expect(res.body.status).equal("success");
    expect(res.body.data.newMessage.group).equal("test-group");
    expect(res.body.data.newMessage.user).equal("rahul@gmail.com");
    expect(res.body.data.newMessage.message).equal("Hello Sayonara");
  });

  it("should get all messages", async () => {
    const res = await agent
      .get("/api/v1/messages/test-group")
      .set("Cookie", `jwt=${token}`);
    expect(res.statusCode).equal(200);
    expect(res.body.status).equal("success");
    expect(res.body.data.message[0].message).equal("Hello Sayonara");
    expect(res.body.data.message[0].group).equal("test-group");
  });

  it("should not get messages", async () => {
    const res = await agent
      .get("/api/v1/messages/test-group-1")
      .set("Cookie", `jwt=${token}`);
    expect(res.statusCode).equal(500);
    expect(res.body.status).equal("error");
    expect(res.body.message).equal(
      "you are not member of the group test-group-1"
    );
  });

  it("should like message", async () => {
    const res = await agent
      .get("/api/v1/messages/test-group")
      .set("Cookie", `jwt=${token}`);
    const messageId = res.body.data.message[0]._id;
    const messageResponse = await agent
      .post("/api/v1/messages/like")
      .set("Cookie", `jwt=${token}`)
      .send({ messageId });
    expect(messageResponse.statusCode).equal(200);
    expect(messageResponse.body.status).equal("success");
    expect(messageResponse.body.data.message.likedBy[0]).equal(
      "rahul@gmail.com"
    );
  });

  it("should unlike message", async () => {
    const res = await agent
      .get("/api/v1/messages/test-group")
      .set("Cookie", `jwt=${token}`);
    const messageId = res.body.data.message[0]._id;
    const messageResponse = await agent
      .post("/api/v1/messages/unlike")
      .set("Cookie", `jwt=${token}`)
      .send({ messageId });
    expect(messageResponse.statusCode).equal(200);
    expect(messageResponse.body.status).equal("success");
    expect(messageResponse.body.data.message.likedBy.length).equal(0);
  });

  it("should not send message if user is not added to group", async () => {
    // login with different user
    const loginData = {
      email: "pragya@gmail.com",
      password: "pragya@23",
    };

    const user = await agent.post("/api/v1/users/login").send(loginData);
    token = user.body.token;
    const data = {
      group: "test-group-2",
      message: "Hello!",
    };

    const res = await agent
      .post("/api/v1/messages")
      .set("Cookie", `jwt=${token}`)
      .send(data);
    expect(res.statusCode).equal(500);
    expect(res.body.status).equal("error");
    expect(res.body.message).equal(
      "you are not member of the group test-group-2!"
    );
  });
});

describe("USER", () => {
  const agent = request.agent(app);
  it("should create user", async () => {
    const payload = {
      email: "admin@gmail.com",
      password: "admin@52",
    };
    // login with admin credential
    const response = await request(app)
      .post("/api/v1/users/login")
      .send(payload);
    token = response.body.token;
    const data = {
      name: "sumit",
      email: "sumit@gmail.com",
      password: "sumit@52",
      passwordConfirm: "sumit@52",
    };

    const res = await agent
      .post("/api/v1/users/signup")
      .set("Cookie", `jwt=${token}`)
      .send(data);
    expect(res.statusCode).equal(201);
    expect(res.body.status).equal("success");
    expect(res.body.data.name).equal("sumit");
    expect(res.body.data.email).equal("sumit@gmail.com");
  });

  it("should login user", async () => {
    const data = {
      email: "admin@gmail.com",
      password: "admin@52",
    };
    const res = await request(app).post("/api/v1/users/login").send(data);
    token = res.body.token;
    expect(res.statusCode).equal(200);
    expect(res.body.status).equal("success");
  });

  it("should not login user", async () => {
    const data = {
      email: "admin@gmail.com",
      password: "admin@23",
    };
    const res = await agent.post("/api/v1/users/login").send(data);
    expect(res.statusCode).equal(500);
    expect(res.body.message).equal("Incorrect email or password");
  });

  it("should update user", async () => {
    const data = {
      email: "rahul@gmail.com",
      data: {
        name: "rahul shanker",
      },
    };
    const res = await agent
      .put("/api/v1/users/update")
      .set("Cookie", `jwt=${token}`)
      .send(data);
    expect(res.statusCode).equal(200);
    expect(res.body.status).equal("success");
    expect(res.body.data.newUser.name).equal("rahul shanker");
    expect(res.body.data.newUser.email).equal("rahul@gmail.com");
  });

  it("should logout user", async () => {
    const res = await agent
      .set("Cookie", `jwt=${token}`)
      .get("/api/v1/users/logout");
    expect(res.statusCode).equal(200);
    expect(res.body.status).equal("success");
  });
});
