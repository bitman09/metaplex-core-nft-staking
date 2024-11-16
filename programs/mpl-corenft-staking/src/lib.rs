use anchor_lang::{ prelude::*, AnchorDeserialize };

pub mod constant;
pub mod error;
pub mod instructions;
pub mod state;
use constant::*;
use error::*;
use instructions::*;
use state::*;

declare_id!("your program ID");

#[program]
pub mod mpl_corenft_pnft_staking {
    use super::*;

    /**
     * User can lock Core NFTs from specific collection
     */
    pub fn lock_corenft(ctx: Context<LockCoreNFT>) -> Result<()> {
        lock_corenft::lock_corenft_handler(ctx)
    }

    /**
     * User can unlock Core NFTs when they want
     */
    pub fn unlock_corenft(ctx: Context<UnlockCoreNFT>) -> Result<()> {
        unlock_corenft::unlock_corenft_handler(ctx)
    }
}
