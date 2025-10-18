-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT DEFAULT 'general',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SystemSettings_key_key" ON "SystemSettings"("key");

-- CreateIndex
CREATE INDEX "SystemSettings_category_idx" ON "SystemSettings"("category");

-- Insert default settings
INSERT INTO "SystemSettings" ("key", "value", "description", "category", "updatedAt") VALUES
('payment_currency', 'CAD', 'Default currency for payments (CAD or USD)', 'payment', CURRENT_TIMESTAMP),
('stripe_enabled', 'true', 'Enable Stripe payment processing', 'payment', CURRENT_TIMESTAMP),
('company_name', 'FlyRentals', 'Company name', 'general', CURRENT_TIMESTAMP),
('company_email', 'info@flyrentals.ca', 'Company email', 'general', CURRENT_TIMESTAMP);
