<?php	
unset($form['links']);
unset($form['name']['#title']);
unset($form['pass']['#title']);
?>
	<div id="pagecontent">
			<div id="login">
				<div id="left">
					<h3>Returning Customers:</h3>
					Please sign in before continuing for access to convenient features
					and quick checkout. <br>
						
						<form action="/market/"  accept-charset="UTF-8" method="post" id="user-login-form">
						<table width="100%">
							<tbody style="border-top:1px solid #DADADA;">
								<tr>
									<td align="left" valign="middle" width="20%">Username</td>
									<td align="left" valign="top" width="80%">
										<?php echo drupal_render($form['name'])?>									
									</td>
								</tr>
								<tr>
									<td align="left" valign="middle" width="20%">Password</td>
									<td align="left" valign="top" width="80%">
										<?php echo drupal_render($form['pass'])?>
									</td>
								</tr>
								<tr>
								    <td align="left" valign="middle" width="20%"></td>
								    <td align="left" valign="top" width="80%">
								    <small>
									<a href="/market/user/password">I FORGOT MY PASSWORD....</a>
								    </small>
								    </td>
								</tr>
								<tr>
									<td align="left" valign="top" width="20%"></td>
									<td align="left" valign="top" width="80%">
										<?php echo drupal_render($form['submit'])?>
									<!--<button type="submit" name="login" id="loginBtn" class="cartoptionbtn"></button>--></td>
								</tr>
							</tbody>
						</table>
						<?php echo drupal_render($form);?>
						</form>
					
				</div>

				<div id="right">
					<h3>New Customers:</h3>
					Register to use convenient features and quick checkout. <br>
					<br>
					
						<table width="100%">
							<tbody style="border-top:1px solid #EFEFEF;">
								<tr>
									<td align="left" valign="top" width="20%">Email</td>
									<td align="left" valign="top" width="80%"><input name="email" size="40" type="email"></td>
								</tr>
								<tr>
									<td align="left" valign="top" width="20%"></td>
									<td align="left" valign="top" width="80%">
										<a href="/market/user/register" class="cartoptionbtn" >Register</a>
										<button type="submit" id="registerBtn" style="visibility: hidden;"></button></td>
								</tr>
							</tbody>
						</table>
					
				</div>
				<div class="clear"></div>
			</div>
		</div>
