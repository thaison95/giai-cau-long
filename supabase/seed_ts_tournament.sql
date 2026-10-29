-- Seed script for Trusting Social Badminton Tournament
-- Tournament ID: c90dd0b1-a512-412b-ba3c-e7ae4d40db73

DO $$
DECLARE
  v_tourney_id uuid := 'c90dd0b1-a512-412b-ba3c-e7ae4d40db73';
  v_group_id uuid;
  v_team_1 uuid;
  v_team_2 uuid;
  v_team_3 uuid;
  v_team_4 uuid;
  v_team_5 uuid;
  v_team_6 uuid;
  v_p_1_Bảo uuid;
  v_p_1_Nhân uuid;
  v_p_1_P_Long uuid;
  v_p_1_Q_Long uuid;
  v_p_1_Sang uuid;
  v_p_1_Thảo uuid;
  v_p_2_Giang uuid;
  v_p_2_Gương uuid;
  v_p_2_Luân uuid;
  v_p_2_Thiên uuid;
  v_p_2_Phúc uuid;
  v_p_2_Tú uuid;
  v_p_3_Dũng uuid;
  v_p_3_Huy uuid;
  v_p_3_Minh uuid;
  v_p_3_Đức uuid;
  v_p_3_Oanh uuid;
  v_p_3_Khánh uuid;
  v_p_4_An uuid;
  v_p_4_Xuân uuid;
  v_p_4_Nhi uuid;
  v_p_4_Nhực uuid;
  v_p_4_Sơn uuid;
  v_p_4_Tuấn uuid;
  v_p_5_Quân uuid;
  v_p_5_Hạnh uuid;
  v_p_5_Nhu_Em uuid;
  v_p_5_Hồng uuid;
  v_p_5_Tâm uuid;
  v_p_5_Hào uuid;
  v_p_6_Cường uuid;
  v_p_6_K_Đào uuid;
  v_p_6_Mindy uuid;
  v_p_6_Bình uuid;
  v_p_6_T_Huy uuid;
  v_p_6_Triết uuid;
  v_tie_id uuid;
  v_rub_1 uuid; v_rub_2 uuid; v_rub_3 uuid;
BEGIN

  -- 0. Xóa dữ liệu cũ của giải để seed lại hoàn toàn sạch sẽ
  DELETE FROM public.ties WHERE tournament_id = v_tourney_id;
  DELETE FROM public.teams WHERE tournament_id = v_tourney_id;
  DELETE FROM public.tournament_groups WHERE tournament_id = v_tourney_id;

  -- 1. Tạo Bảng A
  INSERT INTO public.tournament_groups(tournament_id, name, sort_order)
  VALUES (v_tourney_id, 'Bảng A', 1)
  RETURNING id INTO v_group_id;

  -- 2. Tạo 6 Đội (Không hạt giống: seed = null)
  INSERT INTO public.teams(tournament_id, group_id, name, short_name, flag_emoji, seed)
  VALUES (v_tourney_id, v_group_id, 'Đội 1', 'Đ1', '1️⃣', null)
  RETURNING id INTO v_team_1;
  INSERT INTO public.teams(tournament_id, group_id, name, short_name, flag_emoji, seed)
  VALUES (v_tourney_id, v_group_id, 'Đội 2', 'Đ2', '2️⃣', null)
  RETURNING id INTO v_team_2;
  INSERT INTO public.teams(tournament_id, group_id, name, short_name, flag_emoji, seed)
  VALUES (v_tourney_id, v_group_id, 'Đội 3', 'Đ3', '3️⃣', null)
  RETURNING id INTO v_team_3;
  INSERT INTO public.teams(tournament_id, group_id, name, short_name, flag_emoji, seed)
  VALUES (v_tourney_id, v_group_id, 'Đội 4', 'Đ4', '4️⃣', null)
  RETURNING id INTO v_team_4;
  INSERT INTO public.teams(tournament_id, group_id, name, short_name, flag_emoji, seed)
  VALUES (v_tourney_id, v_group_id, 'Đội 5', 'Đ5', '5️⃣', null)
  RETURNING id INTO v_team_5;
  INSERT INTO public.teams(tournament_id, group_id, name, short_name, flag_emoji, seed)
  VALUES (v_tourney_id, v_group_id, 'Đội 6', 'Đ6', '6️⃣', null)
  RETURNING id INTO v_team_6;

  -- 3. Tạo Vận động viên cho từng đội (Đầy đủ họ tên, giới tính)

  -- VĐV Đội 1
  INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
  VALUES (v_tourney_id, v_team_1, 'Bảo Thái', 'm', 1)
  RETURNING id INTO v_p_1_Bảo;
  INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
  VALUES (v_tourney_id, v_team_1, 'Lê Thanh Nhân', 'm', 2)
  RETURNING id INTO v_p_1_Nhân;
  INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
  VALUES (v_tourney_id, v_team_1, 'Nguyễn Lê Phi Long', 'm', 3)
  RETURNING id INTO v_p_1_P_Long;
  INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
  VALUES (v_tourney_id, v_team_1, 'Phạm Quốc Long', 'm', 4)
  RETURNING id INTO v_p_1_Q_Long;
  INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
  VALUES (v_tourney_id, v_team_1, 'Sang', 'm', 5)
  RETURNING id INTO v_p_1_Sang;
  INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
  VALUES (v_tourney_id, v_team_1, 'Thảo Đặng', 'f', 6)
  RETURNING id INTO v_p_1_Thảo;

  -- VĐV Đội 2
  INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
  VALUES (v_tourney_id, v_team_2, 'Giang', 'm', 1)
  RETURNING id INTO v_p_2_Giang;
  INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
  VALUES (v_tourney_id, v_team_2, 'Guong Pham', 'f', 2)
  RETURNING id INTO v_p_2_Gương;
  INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
  VALUES (v_tourney_id, v_team_2, 'Luân pickleball', 'm', 3)
  RETURNING id INTO v_p_2_Luân;
  INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
  VALUES (v_tourney_id, v_team_2, 'Nguyễn Minh Thiên', 'm', 4)
  RETURNING id INTO v_p_2_Thiên;
  INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
  VALUES (v_tourney_id, v_team_2, 'Phuc Cao', 'f', 5)
  RETURNING id INTO v_p_2_Phúc;
  INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
  VALUES (v_tourney_id, v_team_2, 'Trần Văn Tú', 'm', 6)
  RETURNING id INTO v_p_2_Tú;

  -- VĐV Đội 3
  INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
  VALUES (v_tourney_id, v_team_3, 'Dũng thứ 2', 'm', 1)
  RETURNING id INTO v_p_3_Dũng;
  INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
  VALUES (v_tourney_id, v_team_3, 'Huy Vũ', 'm', 2)
  RETURNING id INTO v_p_3_Huy;
  INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
  VALUES (v_tourney_id, v_team_3, 'Minh - RiskVN', 'm', 3)
  RETURNING id INTO v_p_3_Minh;
  INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
  VALUES (v_tourney_id, v_team_3, 'Nguyễn Ngô Minh Đức', 'm', 4)
  RETURNING id INTO v_p_3_Đức;
  INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
  VALUES (v_tourney_id, v_team_3, 'Oanh', 'f', 5)
  RETURNING id INTO v_p_3_Oanh;
  INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
  VALUES (v_tourney_id, v_team_3, 'Trần Minh Khánh', 'm', 6)
  RETURNING id INTO v_p_3_Khánh;

  -- VĐV Đội 4
  INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
  VALUES (v_tourney_id, v_team_4, 'An Nguyễn', 'm', 1)
  RETURNING id INTO v_p_4_An;
  INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
  VALUES (v_tourney_id, v_team_4, 'Nguyễn Viết Xuân', 'm', 2)
  RETURNING id INTO v_p_4_Xuân;
  INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
  VALUES (v_tourney_id, v_team_4, 'Nhi Doan', 'f', 3)
  RETURNING id INTO v_p_4_Nhi;
  INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
  VALUES (v_tourney_id, v_team_4, 'Nhực Corn', 'm', 4)
  RETURNING id INTO v_p_4_Nhực;
  INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
  VALUES (v_tourney_id, v_team_4, 'Thái Sơn', 'm', 5)
  RETURNING id INTO v_p_4_Sơn;
  INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
  VALUES (v_tourney_id, v_team_4, 'Tuấn Bùi', 'm', 6)
  RETURNING id INTO v_p_4_Tuấn;

  -- VĐV Đội 5
  INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
  VALUES (v_tourney_id, v_team_5, 'Đồng Minh Quân', 'm', 1)
  RETURNING id INTO v_p_5_Quân;
  INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
  VALUES (v_tourney_id, v_team_5, 'Hạnh Phạm', 'f', 2)
  RETURNING id INTO v_p_5_Hạnh;
  INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
  VALUES (v_tourney_id, v_team_5, 'Lê Hồng Nhu Em', 'm', 3)
  RETURNING id INTO v_p_5_Nhu_Em;
  INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
  VALUES (v_tourney_id, v_team_5, 'Nguyễn Ngọc Ánh Hồng', 'f', 4)
  RETURNING id INTO v_p_5_Hồng;
  INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
  VALUES (v_tourney_id, v_team_5, 'Phạm Ngọc Tâm', 'm', 5)
  RETURNING id INTO v_p_5_Tâm;
  INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
  VALUES (v_tourney_id, v_team_5, 'Tăng Anh Hào', 'm', 6)
  RETURNING id INTO v_p_5_Hào;

  -- VĐV Đội 6
  INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
  VALUES (v_tourney_id, v_team_6, 'Cường Châu', 'm', 1)
  RETURNING id INTO v_p_6_Cường;
  INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
  VALUES (v_tourney_id, v_team_6, 'Khánh Đào', 'm', 2)
  RETURNING id INTO v_p_6_K_Đào;
  INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
  VALUES (v_tourney_id, v_team_6, 'Mindy', 'f', 3)
  RETURNING id INTO v_p_6_Mindy;
  INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
  VALUES (v_tourney_id, v_team_6, 'Nguyễn Thanh Bình', 'm', 4)
  RETURNING id INTO v_p_6_Bình;
  INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
  VALUES (v_tourney_id, v_team_6, 'Nguyễn Tiến Huy', 'm', 5)
  RETURNING id INTO v_p_6_T_Huy;
  INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
  VALUES (v_tourney_id, v_team_6, 'Triết Trương', 'm', 6)
  RETURNING id INTO v_p_6_Triết;

  -- 4. Tạo 15 Trận đồng đội (Ties) và Lineup theo ma trận 3 sân song song

  -- Tie #1: Đội 1 vs Đội 2
  INSERT INTO public.ties(tournament_id, stage, group_id, round_label, round_order, team_a_id, team_b_id, court)
  VALUES (v_tourney_id, 'group', v_group_id, 'Vòng bảng: Đội 1 vs Đội 2', 1, v_team_1, v_team_2, 'Sân 1, 2, 3')
  RETURNING id INTO v_tie_id;

  UPDATE public.rubbers SET court = 'Sân 1' WHERE tie_id = v_tie_id AND position = 1 RETURNING id INTO v_rub_1;
  UPDATE public.rubbers SET court = 'Sân 2' WHERE tie_id = v_tie_id AND position = 2 RETURNING id INTO v_rub_2;
  UPDATE public.rubbers SET court = 'Sân 3' WHERE tie_id = v_tie_id AND position = 3 RETURNING id INTO v_rub_3;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_1_Q_Long);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_1_Sang);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_2_Giang);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_2_Tú);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_1_Nhân);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_1_P_Long);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_2_Luân);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_2_Thiên);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_1_Bảo);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_1_Thảo);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_2_Giang);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_2_Gương);

  -- Tie #2: Đội 1 vs Đội 3
  INSERT INTO public.ties(tournament_id, stage, group_id, round_label, round_order, team_a_id, team_b_id, court)
  VALUES (v_tourney_id, 'group', v_group_id, 'Vòng bảng: Đội 1 vs Đội 3', 2, v_team_1, v_team_3, 'Sân 1, 2, 3')
  RETURNING id INTO v_tie_id;

  UPDATE public.rubbers SET court = 'Sân 1' WHERE tie_id = v_tie_id AND position = 1 RETURNING id INTO v_rub_1;
  UPDATE public.rubbers SET court = 'Sân 2' WHERE tie_id = v_tie_id AND position = 2 RETURNING id INTO v_rub_2;
  UPDATE public.rubbers SET court = 'Sân 3' WHERE tie_id = v_tie_id AND position = 3 RETURNING id INTO v_rub_3;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_1_Bảo);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_1_Q_Long);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_3_Dũng);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_3_Minh);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_1_Nhân);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_1_P_Long);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_3_Huy);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_3_Khánh);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_1_Sang);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_1_Thảo);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_3_Đức);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_3_Oanh);

  -- Tie #3: Đội 1 vs Đội 4
  INSERT INTO public.ties(tournament_id, stage, group_id, round_label, round_order, team_a_id, team_b_id, court)
  VALUES (v_tourney_id, 'group', v_group_id, 'Vòng bảng: Đội 1 vs Đội 4', 3, v_team_1, v_team_4, 'Sân 1, 2, 3')
  RETURNING id INTO v_tie_id;

  UPDATE public.rubbers SET court = 'Sân 1' WHERE tie_id = v_tie_id AND position = 1 RETURNING id INTO v_rub_1;
  UPDATE public.rubbers SET court = 'Sân 2' WHERE tie_id = v_tie_id AND position = 2 RETURNING id INTO v_rub_2;
  UPDATE public.rubbers SET court = 'Sân 3' WHERE tie_id = v_tie_id AND position = 3 RETURNING id INTO v_rub_3;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_1_Nhân);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_1_Bảo);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_4_Xuân);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_4_An);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_1_Q_Long);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_1_Sang);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_4_Sơn);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_4_Nhực);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_1_P_Long);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_1_Thảo);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_4_Tuấn);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_4_Nhi);

  -- Tie #4: Đội 1 vs Đội 5
  INSERT INTO public.ties(tournament_id, stage, group_id, round_label, round_order, team_a_id, team_b_id, court)
  VALUES (v_tourney_id, 'group', v_group_id, 'Vòng bảng: Đội 1 vs Đội 5', 4, v_team_1, v_team_5, 'Sân 1, 2, 3')
  RETURNING id INTO v_tie_id;

  UPDATE public.rubbers SET court = 'Sân 1' WHERE tie_id = v_tie_id AND position = 1 RETURNING id INTO v_rub_1;
  UPDATE public.rubbers SET court = 'Sân 2' WHERE tie_id = v_tie_id AND position = 2 RETURNING id INTO v_rub_2;
  UPDATE public.rubbers SET court = 'Sân 3' WHERE tie_id = v_tie_id AND position = 3 RETURNING id INTO v_rub_3;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_1_Q_Long);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_1_Sang);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_5_Quân);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_5_Hào);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_1_Nhân);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_1_P_Long);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_5_Tâm);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_5_Nhu_Em);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_1_Bảo);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_1_Thảo);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_5_Quân);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_5_Hồng);

  -- Tie #5: Đội 1 vs Đội 6
  INSERT INTO public.ties(tournament_id, stage, group_id, round_label, round_order, team_a_id, team_b_id, court)
  VALUES (v_tourney_id, 'group', v_group_id, 'Vòng bảng: Đội 1 vs Đội 6', 5, v_team_1, v_team_6, 'Sân 1, 2, 3')
  RETURNING id INTO v_tie_id;

  UPDATE public.rubbers SET court = 'Sân 1' WHERE tie_id = v_tie_id AND position = 1 RETURNING id INTO v_rub_1;
  UPDATE public.rubbers SET court = 'Sân 2' WHERE tie_id = v_tie_id AND position = 2 RETURNING id INTO v_rub_2;
  UPDATE public.rubbers SET court = 'Sân 3' WHERE tie_id = v_tie_id AND position = 3 RETURNING id INTO v_rub_3;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_1_Bảo);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_1_Q_Long);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_6_Cường);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_6_K_Đào);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_1_Nhân);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_1_P_Long);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_6_Triết);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_6_Bình);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_1_Sang);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_1_Thảo);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_6_T_Huy);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_6_Mindy);

  -- Tie #6: Đội 2 vs Đội 3
  INSERT INTO public.ties(tournament_id, stage, group_id, round_label, round_order, team_a_id, team_b_id, court)
  VALUES (v_tourney_id, 'group', v_group_id, 'Vòng bảng: Đội 2 vs Đội 3', 6, v_team_2, v_team_3, 'Sân 1, 2, 3')
  RETURNING id INTO v_tie_id;

  UPDATE public.rubbers SET court = 'Sân 1' WHERE tie_id = v_tie_id AND position = 1 RETURNING id INTO v_rub_1;
  UPDATE public.rubbers SET court = 'Sân 2' WHERE tie_id = v_tie_id AND position = 2 RETURNING id INTO v_rub_2;
  UPDATE public.rubbers SET court = 'Sân 3' WHERE tie_id = v_tie_id AND position = 3 RETURNING id INTO v_rub_3;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_2_Giang);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_2_Luân);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_3_Dũng);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_3_Minh);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_2_Tú);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_2_Thiên);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_3_Huy);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_3_Khánh);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_2_Giang);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_2_Phúc);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_3_Đức);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_3_Oanh);

  -- Tie #7: Đội 2 vs Đội 4
  INSERT INTO public.ties(tournament_id, stage, group_id, round_label, round_order, team_a_id, team_b_id, court)
  VALUES (v_tourney_id, 'group', v_group_id, 'Vòng bảng: Đội 2 vs Đội 4', 7, v_team_2, v_team_4, 'Sân 1, 2, 3')
  RETURNING id INTO v_tie_id;

  UPDATE public.rubbers SET court = 'Sân 1' WHERE tie_id = v_tie_id AND position = 1 RETURNING id INTO v_rub_1;
  UPDATE public.rubbers SET court = 'Sân 2' WHERE tie_id = v_tie_id AND position = 2 RETURNING id INTO v_rub_2;
  UPDATE public.rubbers SET court = 'Sân 3' WHERE tie_id = v_tie_id AND position = 3 RETURNING id INTO v_rub_3;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_2_Giang);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_2_Thiên);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_4_Xuân);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_4_Sơn);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_2_Tú);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_2_Luân);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_4_Nhực);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_4_Tuấn);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_2_Tú);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_2_Phúc);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_4_An);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_4_Nhi);

  -- Tie #8: Đội 2 vs Đội 5
  INSERT INTO public.ties(tournament_id, stage, group_id, round_label, round_order, team_a_id, team_b_id, court)
  VALUES (v_tourney_id, 'group', v_group_id, 'Vòng bảng: Đội 2 vs Đội 5', 8, v_team_2, v_team_5, 'Sân 1, 2, 3')
  RETURNING id INTO v_tie_id;

  UPDATE public.rubbers SET court = 'Sân 1' WHERE tie_id = v_tie_id AND position = 1 RETURNING id INTO v_rub_1;
  UPDATE public.rubbers SET court = 'Sân 2' WHERE tie_id = v_tie_id AND position = 2 RETURNING id INTO v_rub_2;
  UPDATE public.rubbers SET court = 'Sân 3' WHERE tie_id = v_tie_id AND position = 3 RETURNING id INTO v_rub_3;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_2_Giang);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_2_Thiên);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_5_Quân);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_5_Tâm);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_2_Tú);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_2_Luân);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_5_Hào);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_5_Nhu_Em);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_2_Giang);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_2_Phúc);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_5_Tâm);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_5_Hạnh);

  -- Tie #9: Đội 2 vs Đội 6
  INSERT INTO public.ties(tournament_id, stage, group_id, round_label, round_order, team_a_id, team_b_id, court)
  VALUES (v_tourney_id, 'group', v_group_id, 'Vòng bảng: Đội 2 vs Đội 6', 9, v_team_2, v_team_6, 'Sân 1, 2, 3')
  RETURNING id INTO v_tie_id;

  UPDATE public.rubbers SET court = 'Sân 1' WHERE tie_id = v_tie_id AND position = 1 RETURNING id INTO v_rub_1;
  UPDATE public.rubbers SET court = 'Sân 2' WHERE tie_id = v_tie_id AND position = 2 RETURNING id INTO v_rub_2;
  UPDATE public.rubbers SET court = 'Sân 3' WHERE tie_id = v_tie_id AND position = 3 RETURNING id INTO v_rub_3;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_2_Giang);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_2_Tú);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_6_Cường);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_6_T_Huy);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_2_Luân);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_2_Thiên);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_6_K_Đào);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_6_Bình);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_2_Luân);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_2_Gương);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_6_Triết);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_6_Mindy);

  -- Tie #10: Đội 3 vs Đội 4
  INSERT INTO public.ties(tournament_id, stage, group_id, round_label, round_order, team_a_id, team_b_id, court)
  VALUES (v_tourney_id, 'group', v_group_id, 'Vòng bảng: Đội 3 vs Đội 4', 10, v_team_3, v_team_4, 'Sân 1, 2, 3')
  RETURNING id INTO v_tie_id;

  UPDATE public.rubbers SET court = 'Sân 1' WHERE tie_id = v_tie_id AND position = 1 RETURNING id INTO v_rub_1;
  UPDATE public.rubbers SET court = 'Sân 2' WHERE tie_id = v_tie_id AND position = 2 RETURNING id INTO v_rub_2;
  UPDATE public.rubbers SET court = 'Sân 3' WHERE tie_id = v_tie_id AND position = 3 RETURNING id INTO v_rub_3;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_3_Dũng);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_3_Minh);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_4_Xuân);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_4_An);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_3_Huy);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_3_Khánh);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_4_Sơn);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_4_Nhực);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_3_Đức);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_3_Oanh);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_4_Tuấn);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_4_Nhi);

  -- Tie #11: Đội 3 vs Đội 5
  INSERT INTO public.ties(tournament_id, stage, group_id, round_label, round_order, team_a_id, team_b_id, court)
  VALUES (v_tourney_id, 'group', v_group_id, 'Vòng bảng: Đội 3 vs Đội 5', 11, v_team_3, v_team_5, 'Sân 1, 2, 3')
  RETURNING id INTO v_tie_id;

  UPDATE public.rubbers SET court = 'Sân 1' WHERE tie_id = v_tie_id AND position = 1 RETURNING id INTO v_rub_1;
  UPDATE public.rubbers SET court = 'Sân 2' WHERE tie_id = v_tie_id AND position = 2 RETURNING id INTO v_rub_2;
  UPDATE public.rubbers SET court = 'Sân 3' WHERE tie_id = v_tie_id AND position = 3 RETURNING id INTO v_rub_3;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_3_Dũng);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_3_Minh);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_5_Tâm);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_5_Hào);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_3_Huy);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_3_Khánh);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_5_Quân);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_5_Nhu_Em);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_3_Đức);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_3_Oanh);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_5_Hào);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_5_Hồng);

  -- Tie #12: Đội 3 vs Đội 6
  INSERT INTO public.ties(tournament_id, stage, group_id, round_label, round_order, team_a_id, team_b_id, court)
  VALUES (v_tourney_id, 'group', v_group_id, 'Vòng bảng: Đội 3 vs Đội 6', 12, v_team_3, v_team_6, 'Sân 1, 2, 3')
  RETURNING id INTO v_tie_id;

  UPDATE public.rubbers SET court = 'Sân 1' WHERE tie_id = v_tie_id AND position = 1 RETURNING id INTO v_rub_1;
  UPDATE public.rubbers SET court = 'Sân 2' WHERE tie_id = v_tie_id AND position = 2 RETURNING id INTO v_rub_2;
  UPDATE public.rubbers SET court = 'Sân 3' WHERE tie_id = v_tie_id AND position = 3 RETURNING id INTO v_rub_3;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_3_Dũng);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_3_Minh);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_6_Triết);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_6_K_Đào);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_3_Huy);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_3_Khánh);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_6_T_Huy);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_6_Bình);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_3_Đức);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_3_Oanh);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_6_Cường);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_6_Mindy);

  -- Tie #13: Đội 4 vs Đội 5
  INSERT INTO public.ties(tournament_id, stage, group_id, round_label, round_order, team_a_id, team_b_id, court)
  VALUES (v_tourney_id, 'group', v_group_id, 'Vòng bảng: Đội 4 vs Đội 5', 13, v_team_4, v_team_5, 'Sân 1, 2, 3')
  RETURNING id INTO v_tie_id;

  UPDATE public.rubbers SET court = 'Sân 1' WHERE tie_id = v_tie_id AND position = 1 RETURNING id INTO v_rub_1;
  UPDATE public.rubbers SET court = 'Sân 2' WHERE tie_id = v_tie_id AND position = 2 RETURNING id INTO v_rub_2;
  UPDATE public.rubbers SET court = 'Sân 3' WHERE tie_id = v_tie_id AND position = 3 RETURNING id INTO v_rub_3;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_4_Xuân);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_4_Tuấn);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_5_Quân);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_5_Hào);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_4_Nhực);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_4_An);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_5_Tâm);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_5_Nhu_Em);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_4_Sơn);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_4_Nhi);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_5_Quân);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_5_Hạnh);

  -- Tie #14: Đội 4 vs Đội 6
  INSERT INTO public.ties(tournament_id, stage, group_id, round_label, round_order, team_a_id, team_b_id, court)
  VALUES (v_tourney_id, 'group', v_group_id, 'Vòng bảng: Đội 4 vs Đội 6', 14, v_team_4, v_team_6, 'Sân 1, 2, 3')
  RETURNING id INTO v_tie_id;

  UPDATE public.rubbers SET court = 'Sân 1' WHERE tie_id = v_tie_id AND position = 1 RETURNING id INTO v_rub_1;
  UPDATE public.rubbers SET court = 'Sân 2' WHERE tie_id = v_tie_id AND position = 2 RETURNING id INTO v_rub_2;
  UPDATE public.rubbers SET court = 'Sân 3' WHERE tie_id = v_tie_id AND position = 3 RETURNING id INTO v_rub_3;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_4_Xuân);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_4_An);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_6_Cường);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_6_Triết);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_4_Sơn);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_4_Nhực);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_6_K_Đào);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_6_Bình);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_4_Tuấn);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_4_Nhi);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_6_T_Huy);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_6_Mindy);

  -- Tie #15: Đội 5 vs Đội 6
  INSERT INTO public.ties(tournament_id, stage, group_id, round_label, round_order, team_a_id, team_b_id, court)
  VALUES (v_tourney_id, 'group', v_group_id, 'Vòng bảng: Đội 5 vs Đội 6', 15, v_team_5, v_team_6, 'Sân 1, 2, 3')
  RETURNING id INTO v_tie_id;

  UPDATE public.rubbers SET court = 'Sân 1' WHERE tie_id = v_tie_id AND position = 1 RETURNING id INTO v_rub_1;
  UPDATE public.rubbers SET court = 'Sân 2' WHERE tie_id = v_tie_id AND position = 2 RETURNING id INTO v_rub_2;
  UPDATE public.rubbers SET court = 'Sân 3' WHERE tie_id = v_tie_id AND position = 3 RETURNING id INTO v_rub_3;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_5_Tâm);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_5_Quân);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_6_Cường);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_6_Triết);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_5_Hào);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_5_Nhu_Em);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_6_K_Đào);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_6_Bình);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_5_Tâm);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_5_Hồng);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_6_T_Huy);
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_6_Mindy);

  RAISE NOTICE 'Đã cập nhật thành công 6 đội, 36 vận động viên chuẩn xác, bỏ hạt giống và tạo đầy đủ 15 trận cho giải %!', v_tourney_id;
END $$;
