export const rupiah = (value) => `Rp${new Intl.NumberFormat('id-ID').format(Number(value) || 0)}`;
