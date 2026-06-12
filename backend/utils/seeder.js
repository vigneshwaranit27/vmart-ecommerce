const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Product = require('../models/Product');
const { Category } = require('../models/CategoryCart');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected for seeding');

    // Drop ALL collections to fix case conflict
    const db = mongoose.connection.db;
    const cols = await db.listCollections().toArray();
    for (const col of cols) {
      await db.dropCollection(col.name);
      console.log('🗑️  Dropped:', col.name);
    }

    const cats = await Category.insertMany([
      { name: 'Electronics', slug: 'electronics', image: { url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300' } },
      { name: 'Fashion',     slug: 'fashion',     image: { url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300' } },
      { name: 'Home & Living', slug: 'home-living', image: { url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300' } },
      { name: 'Books',       slug: 'books',       image: { url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300' } },
      { name: 'Sports',      slug: 'sports',      image: { url: 'https://images.unsplash.com/photo-1461897104016-0b3b00cc81ee?w=300' } },
      { name: 'Beauty',      slug: 'beauty',      image: { url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300' } },
    ]);
    console.log('✅ Created', cats.length, 'categories');

    await User.create({ name: 'VMart Admin', email: 'admin@vmart.com', password: 'admin123', role: 'admin', phone: '9999999999', isEmailVerified: true });
    await User.create({ name: 'Test User', email: 'user@vmart.com', password: 'user123', phone: '8888888888', isEmailVerified: true });
    console.log('✅ Created users');

    const eId = cats.find(c => c.slug === 'electronics')._id;
    const fId = cats.find(c => c.slug === 'fashion')._id;
    const hId = cats.find(c => c.slug === 'home-living')._id;
    const sId = cats.find(c => c.slug === 'sports')._id;
    const bId = cats.find(c => c.slug === 'beauty')._id;

    await Product.insertMany([
      { name: 'Sony WH-1000XM5 Headphones', slug: 'sony-wh-1000xm5', description: 'Industry leading noise canceling headphones with 30hr battery.', shortDescription: 'Premium noise-canceling headphones', price: 24999, originalPrice: 34990, brand: 'Sony', category: eId, stock: 50, images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600' }], isFeatured: true, isBestSeller: true, freeShipping: true, isNew: false, ratings: { average: 4.7, count: 234 }, tags: ['headphones','sony'] },
      { name: 'Samsung Galaxy S24 Ultra', slug: 'samsung-s24-ultra', description: 'Most powerful Galaxy with 200MP camera and S Pen.', shortDescription: '200MP camera, S Pen', price: 124999, originalPrice: 134999, brand: 'Samsung', category: eId, stock: 30, images: [{ url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600' }], isFeatured: true, isBestSeller: true, freeShipping: true, isNew: true, ratings: { average: 4.8, count: 512 }, tags: ['phone','samsung'] },
      { name: 'Apple MacBook Air M3', slug: 'apple-macbook-air-m3', description: 'M3 chip with 18 hour battery and Liquid Retina display.', shortDescription: 'M3 chip, 18hr battery', price: 114900, originalPrice: 119900, brand: 'Apple', category: eId, stock: 20, images: [{ url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600' }], isFeatured: true, isBestSeller: false, freeShipping: true, isNew: false, ratings: { average: 4.9, count: 389 }, tags: ['laptop','apple'] },
      { name: "Men's Cotton T-Shirt", slug: 'mens-cotton-tshirt', description: 'Premium 100% organic cotton, soft and breathable.', shortDescription: '100% organic cotton', price: 799, originalPrice: 1499, brand: 'VMart Essentials', category: fId, stock: 200, images: [{ url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600' }], isFeatured: false, isBestSeller: true, freeShipping: false, isNew: false, ratings: { average: 4.3, count: 156 }, tags: ['tshirt','men'] },
      { name: 'Yoga Mat with Carry Strap', slug: 'yoga-mat-carry-strap', description: 'Non-slip eco-friendly TPE material, 6mm thickness.', shortDescription: 'Non-slip, 6mm thickness', price: 1299, originalPrice: 2499, brand: 'FitLife', category: sId, stock: 150, images: [{ url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600' }], isFeatured: true, isBestSeller: false, freeShipping: false, isNew: true, ratings: { average: 4.5, count: 89 }, tags: ['yoga','fitness'] },
      { name: 'Minimalist Walnut Desk Lamp', slug: 'walnut-desk-lamp', description: 'LED lamp with 5 brightness levels and touch control.', shortDescription: 'LED, touch control', price: 2499, originalPrice: 3999, brand: 'LumaCraft', category: hId, stock: 75, images: [{ url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600' }], isFeatured: false, isBestSeller: false, freeShipping: false, isNew: true, ratings: { average: 4.6, count: 67 }, tags: ['lamp','home'] },
      { name: 'Vitamin C Brightening Serum', slug: 'vitamin-c-serum', description: '20% Vitamin C with Hyaluronic Acid, brightens skin.', shortDescription: '20% Vitamin C', price: 699, originalPrice: 1299, brand: 'GlowLab', category: bId, stock: 300, images: [{ url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600' }], isFeatured: true, isBestSeller: true, freeShipping: false, isNew: false, ratings: { average: 4.4, count: 203 }, tags: ['skincare','beauty'] },
      { name: 'JBL Charge 5 Speaker', slug: 'jbl-charge-5', description: 'IP67 waterproof portable speaker with 20hr playtime.', shortDescription: 'Waterproof, 20hr battery', price: 14999, originalPrice: 17999, brand: 'JBL', category: eId, stock: 45, images: [{ url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600' }], isFeatured: false, isBestSeller: true, freeShipping: true, isNew: false, ratings: { average: 4.6, count: 178 }, tags: ['speaker','jbl'] },
    ]);
    console.log('✅ Created 8 products');

    console.log('\n🎉 VMart seeded successfully!');
    console.log('👤 Admin: admin@vmart.com / admin123');
    console.log('👤 User:  user@vmart.com  / user123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

seedDB();