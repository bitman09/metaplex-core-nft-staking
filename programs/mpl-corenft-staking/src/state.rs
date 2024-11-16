use anchor_lang::prelude::*;

#[account]
pub struct GlobalPool {
    pub admin: Pubkey,
    pub total_pnft_staked_count: u64,
    pub total_corenft_staked_count: u64,
    pub extra: u128,
}

impl Default for GlobalPool { //struct initialize.
    #[inline] //inline when this code is compiled.
    fn default() -> GlobalPool {
        GlobalPool {
            admin: Pubkey::default(),
            total_pnft_staked_count: 0,
            total_corenft_staked_count: 0,
            extra: 0,
        }
    }
}

impl GlobalPool {
    pub const DATA_SIZE: usize = 8 + std::mem::size_of::<GlobalPool>();
}