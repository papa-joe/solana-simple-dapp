use anchor_lang::prelude::*;

declare_id!("7LHwZUsWaTXai5rVoHcoQPpTNC5pq3XoyWoLd6VUXf1N");

#[program]
pub mod mycooldapp {
  use super::*;
  pub fn start_stuff_off(ctx: Context<StartStuffOff>) -> Result <()> {
    let base_account = &mut ctx.accounts.base_account;
    Ok(())
  }
  
  // The function now accepts a tup param from the user.
  pub fn add_tup(ctx: Context<AddTup>, tup: String) -> Result <()> {
    let base_account = &mut ctx.accounts.base_account;
    let _user = &mut ctx.accounts.user;

    let r = &tup;

    let mut tup_elements = vec![];
    let single_tup_elements = r.split(",");
    for x in single_tup_elements {
        tup_elements.push(x);
    }

    // check if string is enough to represent two 64bit unsigned integer values
    
    // base_account.tup_list.push("1,2".to_string());
    // base_account.tup_list.push("7,3".to_string());
    // base_account.tup_list.push("1,4".to_string());
		
	// Add it to the tup vector.
    if base_account.tup_list.len() < 4 {
        base_account.tup_list.push(r.to_string());
    }
    
    if base_account.tup_list.len() >= 4 {
        for i in 0..base_account.tup_list.len() {
            
            let mut tuplist_elements = vec![];
            let single_tuplist_elements = base_account.tup_list[i].split(",");
            for s in single_tuplist_elements {
                tuplist_elements.push(s);
            }

            let tuplist_element_int: u64 = tuplist_elements[0].parse().unwrap();
            let tup_elements_int: u64 = tup_elements[0].parse().unwrap();
            let second_tuplist_element_int: u64 = tuplist_elements[1].parse().unwrap();
            let second_tup_elements_int: u64 = tup_elements[1].parse().unwrap();            

            if (tuplist_element_int < tup_elements_int) || (second_tuplist_element_int < second_tup_elements_int) {
                base_account.tup_list.push(r.to_string());
                break;
            }
        }
    }

    for i in 0..base_account.tup_list.len() {
        for j in 0..base_account.tup_list.len() - 1 - i {
            let mut tuplist_elements = vec![];
            let mut tuplist_elements_step = vec![];
            let single_tuplist_elements = base_account.tup_list[j].split(",");
            let splitt = base_account.tup_list[j + 1].split(",");
            for s in single_tuplist_elements {
                tuplist_elements.push(s);
            }

            for ss in splitt {
                tuplist_elements_step.push(ss);
            }
            let tuplist_element_int: u64 = tuplist_elements[0].parse().unwrap();
            let tup_elements_int: u64 = tuplist_elements_step[0].parse().unwrap();
            let second_tuplist_element_int: u64 = tuplist_elements[1].parse().unwrap();
            let second_tup_elements_int: u64 = tuplist_elements_step[1].parse().unwrap(); 
            if tup_elements_int > tuplist_element_int {
                base_account.tup_list.swap(j, j + 1);
            }else if tup_elements_int == tuplist_element_int {
                if second_tup_elements_int > second_tuplist_element_int {
                    base_account.tup_list.swap(j, j + 1);
                }
            }
        }
    }

    if base_account.tup_list.len() >= 3 {
        base_account.tup_list.remove(3);
    }
    
    Ok(())
  }

  pub fn get_tup(ctx: Context<GetTup>, tup_index: i32) -> Result <()> {
    let base_account = &mut ctx.accounts.base_account;
    let _user = &mut ctx.accounts.user;

    let num_usize: usize = tup_index as usize;

    require!(num_usize <= base_account.tup_list.len(), MyError::IndexTooLarge);

    for i in 0..base_account.tup_list.len() {
        if i == num_usize - 1 {
            {
                let b = base_account.clone();
                let fd = &b.tup_list[i];
                base_account.zanga.clear();
                base_account.zanga.push(fd.to_string());
            }
        }
    }
    Ok(())
  }
}

#[error_code]
pub enum MyError {
    #[msg("Out of bound")]
    IndexTooLarge
}

#[derive(Accounts)]
pub struct StartStuffOff<'info> {
  #[account(init, payer = user, space = 9000)]
  pub base_account: Account<'info, BaseAccount>,
  #[account(mut)]
  pub user: Signer<'info>,
  pub system_program: Program <'info, System>,
}

// Add the signer who calls the AddTup method to the struct so that we can save it
#[derive(Accounts)]
pub struct AddTup<'info> {
  #[account(mut)]
  pub base_account: Account<'info, BaseAccount>,
  #[account(mut)]
  pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct GetTup<'info> {
  #[account(mut)]
  pub base_account: Account<'info, BaseAccount>,
  #[account(mut)]
  pub user: Signer<'info>,
}

#[account]
pub struct BaseAccount {
    pub tup_list: Vec<String>,
    pub zanga: Vec<String>,
}