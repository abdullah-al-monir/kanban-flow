-- CreateEnum
CREATE TYPE "BoardRole" AS ENUM ('OWNER', 'ADMIN', 'EDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('TASK_CREATED', 'TASK_MOVED', 'TASK_UPDATED', 'TASK_ARCHIVED', 'MEMBER_ADDED', 'MEMBER_REMOVED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "avatar_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boards" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "owner_id" TEXT NOT NULL,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "boards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "board_members" (
    "id" TEXT NOT NULL,
    "board_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "BoardRole" NOT NULL DEFAULT 'EDITOR',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "board_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "columns" (
    "id" TEXT NOT NULL,
    "board_id" TEXT NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "position" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "columns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "column_id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "assignee_id" TEXT,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "position" DOUBLE PRECISION NOT NULL,
    "due_date" TIMESTAMP(3),
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "labels" (
    "id" TEXT NOT NULL,
    "board_id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "color_hex" VARCHAR(7) NOT NULL,

    CONSTRAINT "labels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_labels" (
    "task_id" TEXT NOT NULL,
    "label_id" TEXT NOT NULL,

    CONSTRAINT "task_labels_pkey" PRIMARY KEY ("task_id","label_id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "board_id" TEXT NOT NULL,
    "task_id" TEXT,
    "user_id" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "payload" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "board_members_user_id_idx" ON "board_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "board_members_board_id_user_id_key" ON "board_members"("board_id", "user_id");

-- CreateIndex
CREATE INDEX "columns_board_id_position_idx" ON "columns"("board_id", "position");

-- CreateIndex
CREATE INDEX "tasks_column_id_position_idx" ON "tasks"("column_id", "position");

-- CreateIndex
CREATE INDEX "tasks_assignee_id_idx" ON "tasks"("assignee_id");

-- CreateIndex
CREATE INDEX "activity_logs_board_id_created_at_idx" ON "activity_logs"("board_id", "created_at");

-- AddForeignKey
ALTER TABLE "board_members" ADD CONSTRAINT "board_members_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_members" ADD CONSTRAINT "board_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "columns" ADD CONSTRAINT "columns_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_column_id_fkey" FOREIGN KEY ("column_id") REFERENCES "columns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "labels" ADD CONSTRAINT "labels_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_labels" ADD CONSTRAINT "task_labels_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_labels" ADD CONSTRAINT "task_labels_label_id_fkey" FOREIGN KEY ("label_id") REFERENCES "labels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
