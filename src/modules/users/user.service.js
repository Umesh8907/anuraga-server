import User from "./user.model.js";

/* ---------- Profile ---------- */
const getUserById = async (userId) => {
    return User.findById(userId).select("-passwordHash -refreshTokens");
};

/* ---------- Address Management ---------- */
const addAddress = async (userId, address) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    // First address becomes default
    if (user.addresses.length === 0) {
        address.isDefault = true;
    }

    // If new address is default → unset others
    if (address.isDefault) {
        user.addresses.forEach(a => (a.isDefault = false));
    }

    user.addresses.push(address);
    await user.save();

    return user.addresses;
};

const updateAddress = async (userId, addressId, updates) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const address = user.addresses.id(addressId);
    if (!address) throw new Error("Address not found");

    if (updates.isDefault) {
        user.addresses.forEach(a => (a.isDefault = false));
    }

    Object.assign(address, updates);
    await user.save();

    return user.addresses;
};

const deleteAddress = async (userId, addressId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    user.addresses.id(addressId).remove();

    // Ensure one default address always exists
    if (user.addresses.length > 0 && !user.addresses.some(a => a.isDefault)) {
        user.addresses[0].isDefault = true;
    }

    await user.save();
    return user.addresses;
};

const updateProfile = async (userId, updates) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    // If updating email, check uniqueness (sparse index handles null, but we check for existing)
    if (updates.email && updates.email !== user.email) {
        const existing = await User.findOne({ email: updates.email });
        if (existing) throw new Error("Email already registered");
    }

    Object.assign(user, updates);
    await user.save();

    return user;
};

export default {
    getUserById,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress
};
