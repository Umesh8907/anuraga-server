import userService from "./user.service.js";

/* ---------- Profile ---------- */
export const getProfile = async (req, res, next) => {
    try {
        const user = await userService.getUserById(req.user.id);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

/* ---------- Addresses ---------- */
export const addAddress = async (req, res, next) => {
    try {
        const addresses = await userService.addAddress(
            req.user.id,
            req.body
        );

        res.status(201).json({
            success: true,
            data: addresses
        });
    } catch (error) {
        next(error);
    }
};

export const updateAddress = async (req, res, next) => {
    try {
        const { addressId } = req.params;

        const addresses = await userService.updateAddress(
            req.user.id,
            addressId,
            req.body
        );

        res.status(200).json({
            success: true,
            data: addresses
        });
    } catch (error) {
        next(error);
    }
};

export const deleteAddress = async (req, res, next) => {
    try {
        const { addressId } = req.params;

        const addresses = await userService.deleteAddress(
            req.user.id,
            addressId
        );

        res.status(200).json({
            success: true,
            data: addresses
        });
    } catch (error) {
        next(error);
    }
};
