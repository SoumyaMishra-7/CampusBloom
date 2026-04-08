const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

process.env.JWT_SECRET = "test-secret";

const { createApp } = require("../src/app");
const { connectDatabase, disconnectDatabase } = require("../src/config/database");
const User = require("../src/models/User");
const Certificate = require("../src/models/Certificate");
const AuditLog = require("../src/models/AuditLog");

function createIoMock() {
  const emitted = [];
  return {
    emitted,
    to(room) {
      return {
        emit(event, payload) {
          emitted.push({ room, event, payload });
        }
      };
    }
  };
}

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET);
}

describe("Document Vault certificate workflow", () => {
  let mongod;
  let app;
  let ioMock;
  let student;
  let admin;
  let studentToken;
  let adminToken;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await connectDatabase(mongod.getUri());
  });

  beforeEach(async () => {
    ioMock = createIoMock();
    app = createApp(ioMock);
    await mongoose.connection.db.dropDatabase();

    student = await User.create({
      name: "Student One",
      email: "student@example.com",
      passwordHash: "hash",
      role: "student"
    });

    admin = await User.create({
      name: "Admin One",
      email: "admin@example.com",
      passwordHash: "hash",
      role: "admin"
    });

    studentToken = signToken(student);
    adminToken = signToken(admin);
  });

  afterAll(async () => {
    await disconnectDatabase();
    await mongod.stop();
  });

  it("allows a student to create a pending certificate", async () => {
    const response = await request(app)
      .post("/api/certificates")
      .set("Authorization", `Bearer ${studentToken}`)
      .field("title", "Hackathon Winner")
      .field("description", "Won the campus hackathon")
      .attach("file", Buffer.from("pdf"), "certificate.pdf");

    expect(response.statusCode).toBe(201);
    expect(response.body.status).toBe("pending");
    expect(response.body.studentId.email).toBe("student@example.com");
    expect(ioMock.emitted.some((event) => event.event === "certificate_created")).toBe(true);
  });

  it("allows a student to update a rejected certificate and resets it to pending", async () => {
    const certificate = await Certificate.create({
      title: "Old",
      description: "Old description",
      fileUrl: "http://localhost/file.pdf",
      studentId: student._id,
      status: "rejected"
    });

    const response = await request(app)
      .put(`/api/certificates/${certificate._id}`)
      .set("Authorization", `Bearer ${studentToken}`)
      .field("title", "Updated Title")
      .field("description", "Updated description")
      .attach("file", Buffer.from("new"), "updated.pdf");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("pending");
    expect(response.body.title).toBe("Updated Title");
  });

  it("blocks editing approved certificates", async () => {
    const certificate = await Certificate.create({
      title: "Approved",
      description: "Locked",
      fileUrl: "http://localhost/file.pdf",
      studentId: student._id,
      status: "approved"
    });

    const response = await request(app)
      .put(`/api/certificates/${certificate._id}`)
      .set("Authorization", `Bearer ${studentToken}`)
      .field("title", "Should Fail")
      .field("description", "Still locked");

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Approved certificates cannot be modified");
  });

  it("lets admins approve certificates and records an audit log", async () => {
    const certificate = await Certificate.create({
      title: "Pending Cert",
      description: "Review me",
      fileUrl: "http://localhost/file.pdf",
      studentId: student._id,
      status: "pending"
    });

    const response = await request(app)
      .patch(`/api/certificates/${certificate._id}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "approved", note: "Looks valid" });

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("approved");

    const auditLog = await AuditLog.findOne({ certificateId: certificate._id });
    expect(auditLog).not.toBeNull();
    expect(auditLog.action).toBe("approved");
    expect(ioMock.emitted.some((event) => event.event === "certificate_status_changed")).toBe(true);
  });

  it("limits students to their own records while admins can see all with pagination", async () => {
    await Certificate.create([
      {
        title: "Mine",
        description: "",
        fileUrl: "http://localhost/1.pdf",
        studentId: student._id,
        status: "pending"
      },
      {
        title: "Other",
        description: "",
        fileUrl: "http://localhost/2.pdf",
        studentId: admin._id,
        status: "rejected"
      }
    ]);

    const studentResponse = await request(app)
      .get("/api/certificates")
      .set("Authorization", `Bearer ${studentToken}`);

    const adminResponse = await request(app)
      .get("/api/certificates?page=1&limit=1")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(studentResponse.statusCode).toBe(200);
    expect(studentResponse.body.data).toHaveLength(1);
    expect(studentResponse.body.data[0].title).toBe("Mine");

    expect(adminResponse.statusCode).toBe(200);
    expect(adminResponse.body.pagination.total).toBe(2);
    expect(adminResponse.body.data).toHaveLength(1);
  });

  it("allows students to delete approved certificates", async () => {
    const certificate = await Certificate.create({
      title: "Approved",
      description: "",
      fileUrl: "http://localhost/file.pdf",
      studentId: student._id,
      status: "approved"
    });

    const response = await request(app)
      .delete(`/api/certificates/${certificate._id}`)
      .set("Authorization", `Bearer ${studentToken}`);

    expect(response.statusCode).toBe(204);
    const existing = await Certificate.findById(certificate._id);
    expect(existing).toBeNull();
    expect(ioMock.emitted.some((event) => event.event === "certificate_deleted")).toBe(true);
  });

  it("rejects student status updates with 403", async () => {
    const certificate = await Certificate.create({
      title: "Pending Cert",
      description: "",
      fileUrl: "http://localhost/file.pdf",
      studentId: student._id,
      status: "pending"
    });

    const response = await request(app)
      .patch(`/api/certificates/${certificate._id}/status`)
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ status: "approved" });

    expect(response.statusCode).toBe(403);
  });
});
