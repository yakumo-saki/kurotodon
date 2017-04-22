"use strict";

////////////////////////////////////////////////////////////////////////////////
// アカウント
////////////////////////////////////////////////////////////////////////////////
Contents.account = function( cp )
{
	var p = $( '#' + cp.id );
	var cont = p.find( 'div.contents' );
	var scrollPos = null;

	cp.SetIcon( 'icon-users' );

	////////////////////////////////////////////////////////////
	// プルダウンメニューを作成
	////////////////////////////////////////////////////////////
	function MakePullDown()
	{
		var s = '';

		var _instance_list = {};

		// 初期設定
		_instance_list['pawoo.net'] = true;
		_instance_list['mstdn.jp'] = true;
		_instance_list['mastodon.social'] = true;
		_instance_list['mastodon.cloud'] = true;

		for ( var id in g_cmn.account )
		{
			_instance_list[g_cmn.account[id].instance] = true;
		}

		for ( var instance in _instance_list )
		{
			s += '<div class="item">' + escapeHTML( instance ) + '</div>';
		}

		var pulldown = $( '#login_instance' ).parent().parent().find( '.pulldown' );

		pulldown.html( s );

		if ( s == '' )
		{
			pulldown.hide();
		}
	}

	////////////////////////////////////////////////////////////
	// リスト部作成
	////////////////////////////////////////////////////////////
	var ListMake = function() {
		var items = new Array();
		var cnt = 0;

		for ( var i = 0, _len = g_cmn.account_order.length ; i < _len ; i++ )
		{
			var id = g_cmn.account_order[i];

			items.push( {
				id: g_cmn.account[id].id,
				instance: g_cmn.account[id].instance,
				display_name: g_cmn.account[id].display_name,
				avatar: g_cmn.account[id].avatar,
				statuses_count: g_cmn.account[id].notsave.statuses_count,
				following_count: g_cmn.account[id].notsave.following_count,
				followers_count: g_cmn.account[id].notsave.followers_count,
			} );

			cnt++;
		}

		var assign = {
			items: items,
		};

		$( '#account_list' ).html( OutputTPL( 'account_list', assign ) );

		cont.trigger( 'contents_resize' );

		// 選択の保持
		if ( $( '#account_del' ).attr( 'delid' ) != undefined )
		{
			if ( g_cmn.account[$( '#account_del' ).attr( 'delid' )] != undefined )
			{
				$( '#account_list' ).find( 'div.item[account_id="' + $( '#account_del' ).attr( 'delid' ) + '"]' ).addClass( 'select' );
				$( '#account_del' ).removeClass( 'disabled' );
				$( '#account_setting' ).removeClass( 'disabled' );
				$( '#account_posup' ).removeClass( 'disabled' );
				$( '#account_posdown' ).removeClass( 'disabled' );
			}
		}

		////////////////////////////////////////
		// クリック時処理
		////////////////////////////////////////
		$( '#account_list' ).find( 'div.item' ).click( function( e ) {
			$( '#account_list' ).find( 'div.item' ).removeClass( 'select' );
			$( this ).addClass( 'select' );
			$( '#account_del' )
				.attr( 'delid', $( this ).attr( 'account_id' ) )
				.removeClass( 'disabled' );
			$( '#account_setting' )
				.removeClass( 'disabled' );
			$( '#account_posup' )
				.removeClass( 'disabled' );
			$( '#account_posdown' )
				.removeClass( 'disabled' );

			SetFront( p );

			e.stopPropagation();
		} );

		////////////////////////////////////////
		// アイコンクリック
		////////////////////////////////////////
		$( '#account_list' ).find( 'div.item' ).find( '.icon' ).find( 'img' ).click( function( e ) {
			var account_id = $( this ).parent().parent().attr( 'account_id' );

			OpenUserShow(
				g_cmn.account[account_id].id,
				g_cmn.account[account_id].instance,
				account_id );

			e.stopPropagation();
		} );

		////////////////////////////////////////
		// 名前クリック
		////////////////////////////////////////
		$( '#account_list' ).find( 'div.item' ).find( '.account_display_name' ).click( function( e ) {
			var account_id = $( this ).parent().parent().parent().attr( 'account_id' );

			var _cp = new CPanel( null, null, 360, $( window ).height() * 0.75 );
			_cp.SetType( 'timeline' );
			_cp.SetParam( {
				account_id: account_id,
				timeline_type: 'user',
				user_id: g_cmn.account[account_id].id,
				user_username: g_cmn.account[account_id].username,
				user_display_name: g_cmn.account[account_id].display_name,
				user_instance: g_cmn.account[account_id].instance,
				reload_time: g_cmn.cmn_param['reload_time'],
			} );
			_cp.Start();

			e.stopPropagation();
		} );

		////////////////////////////////////////
		// ホームボタンクリック
		// ローカルボタンクリック
		// 連合ボタンクリック
		////////////////////////////////////////
		$( '#account_list' ).find( 'div.item' ).find( '.buttons' ).find( '.home,.local,.federated' ).click( function( e ) {
			var account_id = $( this ).parent().parent().attr( 'account_id' );

			var timeline_type = $( this ).hasClass( 'home' ) ? 'home' : $( this ).hasClass( 'local' ) ? 'local' : 'federated';

			var _cp = new CPanel( null, null, 360, $( window ).height() * 0.75 );
			_cp.SetType( 'timeline' );
			_cp.SetParam( {
				account_id: account_id,
				timeline_type: timeline_type,
				reload_time: g_cmn.cmn_param['reload_time'],
			} );
			_cp.Start();

			e.stopPropagation();
		} );
	};

	////////////////////////////////////////////////////////////
	// 開始処理
	////////////////////////////////////////////////////////////
	this.start = function() {
		// 全体を作成
		cont.addClass( 'account' )
			.html( OutputTPL( 'account', {} ) );

		MakePullDown();

		////////////////////////////////////////
		// 最小化/設定切替時のスクロール位置
		// 保存/復元
		////////////////////////////////////////
		cont.on( 'contents_scrollsave', function( e, type ) {
			// 保存
			if ( type == 0 )
			{
				if ( scrollPos == null )
				{
					scrollPos = $( '#account_list' ).scrollTop();
				}
			}
			// 復元
			else
			{
				if ( scrollPos != null )
				{
					$( '#account_list' ).scrollTop( scrollPos );
					scrollPos = null;
				}
			}
		} );

		////////////////////////////////////////
		// リサイズ処理
		////////////////////////////////////////
		cont.on( 'contents_resize', function() {
			$( '#account_list' ).height( cont.height() - cont.find( '.panel_btns' ).height() - 1 );
		} );

		////////////////////////////////////////
		// アカウント情報更新
		////////////////////////////////////////
		cont.on( 'account_update', function() {
			// 削除ボタン
			$( '#account_del' ).addClass( 'disabled' );

			// 設定ボタン
			$( '#account_setting' ).addClass( 'disabled' );

			// ▲▼ボタン
			$( '#account_posup' ).addClass( 'disabled' );
			$( '#account_posdown' ).addClass( 'disabled' );

			ListMake();

			// 全削除ボタン有効/無効
			if ( AccountCount() > 0 )
			{
				$( '#account_alldel' ).removeClass( 'disabled' );
			}
			else
			{
				$( '#account_alldel' ).addClass( 'disabled' );
			}
		} );

		////////////////////////////////////////
		// 追加ボタンクリック処理
		////////////////////////////////////////
		$( '#account_add' ).click( function( e ) {
			// disabledなら処理しない
			if ( $( this ).hasClass( 'disabled' ) )
			{
				return;
			}

			$( '#login_window' ).toggle();

			$( '#login_window' ).find( 'input[type=text]:first' ).focus();
		} );

		////////////////////////////////////////
		// 削除ボタンクリック処理
		////////////////////////////////////////
		$( '#account_del' ).click( function( e ) {
			// disabledなら処理しない
			if ( $( this ).hasClass( 'disabled' ) )
			{
				return;
			}

			if ( confirm( i18nGetMessage( 'i18n_0185', [g_cmn.account[$( this ).attr( 'delid' )].display_name] ) ) )
			{
				delete g_cmn.account[$( this ).attr( 'delid' )];

				for ( var i = 0, _len = g_cmn.account_order.length ; i < _len ; i++ )
				{
					if ( g_cmn.account_order[i] == $( this ).attr( 'delid' ) )
					{
						g_cmn.account_order.splice( i, 1 );
						break;
					}
				}

				$( '#account_list' ).find( 'div.item' ).each( function() {
					if ( $( this ).hasClass( 'select' ) )
					{
						$( this ).fadeOut( 'fast', function() { $( '#head' ).trigger( 'account_update' ); } );
					}
				} );

				UpdateToolbarUser();
			}
		} );

		////////////////////////////////////////
		// 全削除ボタンクリック処理
		////////////////////////////////////////
		$( '#account_alldel' ).click( function( e ) {
			// disabledなら処理しない
			if ( $( this ).hasClass( 'disabled' ) )
			{
				return;
			}

			if ( confirm( i18nGetMessage( 'i18n_0073' ) ) )
			{
				g_cmn.account = {};
				g_cmn.account_order = [];

				$( '#account_list' ).find( 'div.item' ).fadeOut( 'fast', function() { $( '#head' ).trigger( 'account_update' ); } );

				UpdateToolbarUser();
			}
		} );

		////////////////////////////////////////
		// アカウント設定ボタンクリック処理
		////////////////////////////////////////
		$( '#account_setting' ).click( function( e ) {
			// disabledなら処理しない
			if ( $( this ).hasClass( 'disabled' ) )
			{
				return;
			}

			var pid = IsUnique( 'accountset' );

			if ( pid == null )
			{
				var _cp = new CPanel( null, null, 360, 420 );
				_cp.SetType( 'accountset' );
				_cp.SetTitle( i18nGetMessage( 'i18n_0047' ) + '(' + g_cmn.account[$( '#account_del' ).attr( 'delid' )].display_name + ')', false );
				_cp.SetParam( {
					account_id: $( '#account_del' ).attr( 'delid' ),
				} );
				_cp.Start();
			}
			else
			{
				var _cp = GetPanel( pid );
				_cp.SetType( 'accountset' );
				_cp.SetTitle( i18nGetMessage( 'i18n_0047' ) + '(' + g_cmn.account[$( '#account_del' ).attr( 'delid' )].display_name + ')', false );
				_cp.SetParam( {
					account_id: $( '#account_del' ).attr( 'delid' ),
				} );
				$( '#' + pid ).find( 'div.contents' ).trigger( 'account_change' );
			}

			e.stopPropagation();
		} );

		////////////////////////////////////////
		// ▲ボタンクリック処理
		////////////////////////////////////////
		$( '#account_posup' ).click( function( e ) {
			// disabledなら処理しない
			if ( $( this ).hasClass( 'disabled' ) )
			{
				return;
			}

			var selid = $( '#account_del' ).attr( 'delid' );

			for ( var i = 0, _len = g_cmn.account_order.length ; i < _len ; i++ )
			{
				if ( g_cmn.account_order[i] == selid )
				{
					if ( i > 0 )
					{
						var tmp = g_cmn.account_order[i - 1];
						g_cmn.account_order[i - 1] = g_cmn.account_order[i];
						g_cmn.account_order[i] = tmp;
						$( '#head' ).trigger( 'account_update' );
					}

					break;
				}
			}

			e.stopPropagation();
		} );

		////////////////////////////////////////
		// ▼ボタンクリック処理
		////////////////////////////////////////
		$( '#account_posdown' ).click( function( e ) {
			// disabledなら処理しない
			if ( $( this ).hasClass( 'disabled' ) )
			{
				return;
			}

			var selid = $( '#account_del' ).attr( 'delid' );

			for ( var i = 0, _len = g_cmn.account_order.length ; i < _len ; i++ )
			{
				if ( g_cmn.account_order[i] == selid )
				{
					if ( i < g_cmn.account_order.length - 1 )
					{
						var tmp = g_cmn.account_order[i + 1];
						g_cmn.account_order[i + 1] = g_cmn.account_order[i];
						g_cmn.account_order[i] = tmp;
						$( '#head' ).trigger( 'account_update' );
					}

					break;
				}
			}

			e.stopPropagation();
		} );

		////////////////////////////////////////
		// 入力文字数によるボタン制御
		////////////////////////////////////////
		$( '#login_instance,#login_email,#login_password' ).on( 'keyup change', function() {

			if ( $( '#login_instance' ).val().length &&
				 $( '#login_email' ).val().length &&
				 $( '#login_password' ).val().length )
			{
				$( '#login_button' ).removeClass( 'disabled' );
			}
			else
			{
				$( '#login_button' ).addClass( 'disabled' );
			}
		} );

		////////////////////////////////////////
		// インスタンス入力ボックスクリック
		////////////////////////////////////////
		$( '#login_instance' ).click( function( e ) {
			var pulldown = $( this ).parent().parent().find( '.pulldown' );

			if ( pulldown.css( 'display' ) == 'none' )
			{
				if ( pulldown.find( 'div.item' ).length )
				{
					pulldown.show()
						.width( $( '#login_instance' ).width() )
						.css( {
							left: $( '#login_instance' ).position().left,
							top: $( '#login_instance' ).position().top + $( '#login_instance' ).outerHeight()
						} );
				}
			}
			else
			{
				pulldown.hide();
			}

			e.stopPropagation();
		} );

		////////////////////////////////////////
		// プルダウン選択
		////////////////////////////////////////
		 $( '#login_instance' ).parent().parent().find( '.pulldown' ).on( 'click', '> div.item', function( e ) {
			$( '#login_instance' ).val( $( this ).text() )
				.trigger( 'keyup' )
				.focus();

			$( this ).parent().hide();

			e.stopPropagation();
		} );

		////////////////////////////////////////////////////////////
		// ログインボタンクリック処理
		////////////////////////////////////////////////////////////
		$( '#login_button' ).click( function( e ) {
			// disabledなら処理しない
			if ( $( this ).hasClass( 'disabled' ) )
			{
				return;
			}

			var _account = {
				client_id: '',
				client_secret: '',
				instance: '',
				access_token: '',
				id: '',
				username: '',
				display_name: '',
				avatar: '',
				notsave: {},
			};

			Blackout( true );
			$( '#account_list' ).activity( { color: '#ffffff' } );

			var instance = $( '#login_instance' ).val();
			var email = $( '#login_email' ).val();
			var password = $( '#login_password' ).val();

			// ClientIDを取得済みなら再利用
			for ( var account_id in g_cmn.account )
			{
				if ( g_cmn.account[account_id].instance == instance )
				{
					_account.client_id = g_cmn.account[account_id].client_id;
					_account.client_secret = g_cmn.account[account_id].client_secret;
					break;
				}
			}

			if ( _account.client_id != '' && _account.client_secret != '' )
			{
				GetAccessToken();
			}
			else
			{
				// ClientIDを取得
				SendRequest(
					{
						action: 'register_app',
						instance: instance,
					},
					function( res )
					{
						if ( res.client_id && res.client_secret )
						{
							_account.client_id = res.client_id;
							_account.client_secret = res.client_secret;
							GetAccessToken();
						}
						else
						{
							ApiError( res );
							$( '#account_list' ).activity( false );
							Blackout( false );
						}
					}
				);
			}

			// アクセストークン取得→アカウント情報取得
			function GetAccessToken()
			{
				SendRequest(
					{
						action: 'get_access_token',
						instance: instance,
						client_id: _account.client_id,
						client_secret: _account.client_secret,
						username: email,
						password: password,
					},
					function( res )
					{
						if ( res.access_token )
						{
							_account.access_token = res.access_token;

							// アカウント情報取得
							SendRequest(
								{
									action: 'api_call',
									instance: instance,
									api: 'accounts/verify_credentials',
									access_token: _account.access_token,
								},
								function( res )
								{
									if ( !res.status )
									{
										_account.instance = instance;
										_account.id = res.id;
										_account.username = res.username;
										_account.display_name = res.display_name;
										_account.avatar = res.avatar;
										_account.notsave.statuses_count = res.statuses_count;
										_account.notsave.following_count = res.following_count;
										_account.notsave.followers_count = res.followers_count;

										g_cmn.account[res.id + '@' + instance] = $.extend( true, {}, _account );

										g_cmn.account_order.push( res.id + '@' + instance );

										$( '#head' ).trigger( 'account_update' );
										UpdateToolbarUser();
										
										$( '#login_window' ).hide();
									}
									else
									{
										ApiError( res );
									}

									$( '#account_list' ).activity( false );
									Blackout( false );
								}
							);
						}
						else
						{
							ApiError( res );
							$( '#account_list' ).activity( false );
							Blackout( false );
						}
					}
				);
			}
		} );

		// リスト部作成処理
		cont.trigger( 'account_update' );
	};

	////////////////////////////////////////////////////////////
	// 終了処理
	////////////////////////////////////////////////////////////
	this.stop = function() {
	};
}
