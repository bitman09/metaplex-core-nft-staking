use crate::*;
use anchor_lang::prelude::Clock;
use mpl_core::{
    ID as CORE_PROGRAM_ID,
    accounts::{BaseAssetV1, BaseCollectionV1}, 
    instructions::{AddPluginV1CpiBuilder}, 
    types::{ FreezeDelegate, Plugin,  UpdateAuthority }, 
};

#[derive(Accounts)]
pub struct LockCoreNFT<'info> {
    pub owner: Signer<'info>,

    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [GLOBAL_AUTHORITY_SEED],
        bump
    )]
    pub global_pool: Account<'info, GlobalPool>,

    #[account(
        mut,
        has_one = owner @ StakingError::InvalidAdmin,
        constraint = asset.update_authority == UpdateAuthority::Collection(collection.key()),
    )]
    pub asset: Account<'info, BaseAssetV1>,

    #[account(
        mut,
    )]
    pub collection: Account<'info, BaseCollectionV1>,
    
    #[account(address = CORE_PROGRAM_ID)]
    /// CHECK: this will be checked by core
    pub core_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

pub fn lock_corenft_handler(ctx: Context<LockCoreNFT>) -> Result<()> { 
    let global_pool = &mut ctx.accounts.global_pool;

    // Freeze the asset  
    AddPluginV1CpiBuilder::new(&ctx.accounts.core_program.to_account_info())
    .asset(&ctx.accounts.asset.to_account_info())
    .collection(Some(&ctx.accounts.collection.to_account_info()))
    .payer(&ctx.accounts.user.to_account_info())
    .system_program(&ctx.accounts.system_program.to_account_info())
    .plugin(Plugin::FreezeDelegate( FreezeDelegate{ frozen: true } ))
    .invoke()?;

    global_pool.total_corenft_staked_count += 1;

    Ok(())
}