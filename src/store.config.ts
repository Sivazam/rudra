// Using placeholder images from Unsplash with proper dimensions
export const config = {
        categories: [
                { 
                        name: "Rudraksha", 
                        slug: "rudraksha", 
                        image: { 
                                src: "https://images.unsplash.com/photo-1610374816331-933e1b455785?w=800&h=600&fit=crop",
                                width: 800,
                                height: 600
                        }
                },
                { 
                        name: "Malas", 
                        slug: "malas", 
                        image: { 
                                src: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&h=600&fit=crop",
                                width: 800,
                                height: 600
                        }
                },
                { 
                        name: "Bracelets", 
                        slug: "bracelets", 
                        image: { 
                                src: "https://images.unsplash.com/photo-1611089522819-8e361b6a9aaf?w=800&h=600&fit=crop",
                                width: 800,
                                height: 600
                        }
                },
                { 
                        name: "Gemstones", 
                        slug: "gemstones", 
                        image: { 
                                src: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop",
                                width: 800,
                                height: 600
                        }
                },
                { 
                        name: "Yantras", 
                        slug: "yantras", 
                        image: { 
                                src: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop",
                                width: 800,
                                height: 600
                        }
                },
        ],

        social: {
                facebook: "https://facebook.com/sanathanrudraksha",
                instagram: "https://instagram.com/sanathanrudraksha",
        },

        contact: {
                email: "info@sanathanrudraksha.com",
                phone: "+91 98765 43210",
                address: "123 Spiritual Street, Delhi, India",
        },
};

export type StoreConfig = typeof config;
export default config;